"""
API views for Nova Lost & Found application.
"""
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Item, Match, Notification, ContactRequest
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ItemSerializer,
    ItemCreateSerializer, MatchSerializer, NotificationSerializer,
    ContactRequestSerializer
)
from .permissions import IsOwnerOrReadOnly, IsOwner

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user profile."""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(
                request.user,
                data=request.data,
                partial=request.method == 'PATCH'
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class RegisterView(viewsets.GenericViewSet):
    """ViewSet for user registration."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class ItemViewSet(viewsets.ModelViewSet):
    """ViewSet for item management."""
    queryset = Item.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'status', 'category']
    search_fields = ['category', 'description', 'brand', 'color', 'location']
    ordering_fields = ['created_at', 'date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ItemCreateSerializer
        return ItemSerializer
    
    def perform_create(self, serializer):
        """Create item and trigger AI indexing."""
        item = serializer.save()
        
        # Trigger AI indexing in background
        try:
            self._index_item_in_ai(item)
        except Exception as e:
            # Log error but don't fail the request
            print(f"AI indexing failed: {str(e)}")
    
    def _index_item_in_ai(self, item):
        """Index item in AI service."""
        ai_url = f"{settings.AI_SERVICE_URL}/items/add"
        
        # Prepare data for AI service
        data = {
            'item_id': str(item.id),
            'item_type': item.type,
            'description': item.description or '',
        }
        
        files = {}
        if item.image:
            # Open and send image file
            with item.image.open('rb') as img_file:
                files['image'] = img_file
                response = requests.post(ai_url, data=data, files=files, timeout=30)
        else:
            response = requests.post(ai_url, data=data, timeout=30)
        
        if response.status_code == 200:
            item.ai_indexed = True
            item.ai_index_id = str(item.id)
            item.save(update_fields=['ai_indexed', 'ai_index_id'])
    
    @action(detail=False, methods=['get'])
    def my_items(self, request):
        """Get current user's items."""
        items = self.queryset.filter(user=request.user)
        
        # Apply filters
        item_type = request.query_params.get('type')
        item_status = request.query_params.get('status')
        
        if item_type:
            items = items.filter(type=item_type)
        if item_status:
            items = items.filter(status=item_status)
        
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update item status."""
        item = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Item.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.status = new_status
        item.save(update_fields=['status', 'updated_at'])
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)


class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for match management."""
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get matches for current user's items."""
        user = self.request.user
        return Match.objects.filter(
            models.Q(lost_item__user=user) | models.Q(found_item__user=user)
        ).distinct()
    
    @action(detail=False, methods=['post'])
    def trigger_matching(self, request):
        """Trigger AI matching for an item."""
        item_id = request.data.get('item_id')
        item_type = request.data.get('item_type')
        
        if not item_id or not item_type:
            return Response(
                {'error': 'item_id and item_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = Item.objects.get(id=item_id, user=request.user)
        except Item.DoesNotExist:
            return Response(
                {'error': 'Item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Call AI service to find matches
        try:
            matches = self._find_matches_via_ai(item)
            
            # Create match records
            created_matches = []
            for match_data in matches:
                # Get the matched item
                matched_item_id = match_data['item_id']
                match_score = match_data['score'] * 100  # Convert to percentage
                
                try:
                    if item.type == 'lost':
                        found_item = Item.objects.get(id=matched_item_id, type='found')
                        match, created = Match.objects.get_or_create(
                            lost_item=item,
                            found_item=found_item,
                            defaults={'match_score': match_score}
                        )
                    else:  # found
                        lost_item = Item.objects.get(id=matched_item_id, type='lost')
                        match, created = Match.objects.get_or_create(
                            lost_item=lost_item,
                            found_item=item,
                            defaults={'match_score': match_score}
                        )
                    
                    if created:
                        created_matches.append(match)
                        # Create notifications for both users
                        self._create_match_notifications(match)
                
                except Item.DoesNotExist:
                    continue
            
            serializer = self.get_serializer(created_matches, many=True)
            return Response({
                'matches_found': len(created_matches),
                'matches': serializer.data
            })
        
        except Exception as e:
            return Response(
                {'error': f'AI matching failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _find_matches_via_ai(self, item):
        """Call AI service to find matches."""
        # Determine search endpoint based on item type
        if item.type == 'lost':
            ai_url = f"{settings.AI_SERVICE_URL}/search/lost"
        else:
            ai_url = f"{settings.AI_SERVICE_URL}/search/found"
        
        # Prepare request data
        data = {}
        files = {}
        
        if item.description:
            data['text'] = item.description
        
        if item.image:
            with item.image.open('rb') as img_file:
                files['image'] = ('image.jpg', img_file, 'image/jpeg')
                response = requests.post(
                    ai_url,
                    data=data,
                    files=files,
                    params={'top_k': 10},
                    timeout=30
                )
        else:
            response = requests.post(
                ai_url,
                data=data,
                params={'top_k': 10},
                timeout=30
            )
        
        response.raise_for_status()
        result = response.json()
        return result.get('matches', [])
    
    def _create_match_notifications(self, match):
        """Create notifications for both users in a match."""
        # Notify lost item owner
        Notification.objects.create(
            user=match.lost_item.user,
            type='match_found',
            title='Potential Match Found!',
            message=f'We found a potential match for your lost {match.lost_item.category}',
            related_item=match.lost_item,
            related_match=match
        )
        
        # Notify found item owner
        Notification.objects.create(
            user=match.found_item.user,
            type='match_found',
            title='Potential Match Found!',
            message=f'Your found {match.found_item.category} may match a lost item',
            related_item=match.found_item,
            related_match=match
        )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update match status (confirm/reject)."""
        match = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Match.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        match.status = new_status
        match.save(update_fields=['status', 'updated_at'])
        
        # Update item statuses if match is confirmed
        if new_status == 'confirmed':
            match.lost_item.status = 'matched'
            match.lost_item.save(update_fields=['status'])
            match.found_item.status = 'matched'
            match.found_item.save(update_fields=['status'])
        
        serializer = self.get_serializer(match)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for notification management."""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for current user."""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark notification as read."""
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=['read'])
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        self.get_queryset().update(read=True)
        return Response({'status': 'all notifications marked as read'})


class ContactRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for contact request management."""
    queryset = ContactRequest.objects.all()
    serializer_class = ContactRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Users can see:
        1. Requests they sent
        2. Requests for their items
        """
        user = self.request.user
        return ContactRequest.objects.filter(
            models.Q(requester=user) | models.Q(item__user=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create request and notify item owner."""
        request = serializer.save()
        
        # Notify item owner
        Notification.objects.create(
            user=request.item.user,
            type='contact_request',
            title='New Contact Request',
            message=f'Someone is requesting contact for your {request.item.category}.',
            related_item=request.item
        )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update request status (approve/deny)."""
        contact_request = self.get_object()
        
        # Only item owner can update status
        if contact_request.item.user != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        new_status = request.data.get('status')
        if new_status not in ['approved', 'denied']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        contact_request.status = new_status
        contact_request.save(update_fields=['status', 'updated_at'])
        
        # Notify requester
        Notification.objects.create(
            user=contact_request.requester,
            type='contact_request',
            title=f'Contact Request {new_status.title()}',
            message=f'Your contact request for {contact_request.item.category} has been {new_status}.',
            related_item=contact_request.item
        )
        
        return Response(self.get_serializer(contact_request).data)

