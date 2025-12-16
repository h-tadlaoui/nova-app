"""
Serializers for Nova Lost & Found API.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Item, Match, Notification, ContactRequest

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']

# ... (omitted similar lines for brevity, but I should be careful)
# Actually, I should just modify imports and append serializer.
# Using 'replace_file_content' for imports and then appending serializer is better.
# Let's do imports first.


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'user', 'user_email', 'type', 'category', 'description',
            'brand', 'color', 'location', 'date', 'time', 'status',
            'image', 'image_url', 'contact_email', 'contact_phone',
            'ai_indexed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'ai_indexed', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating items."""
    
    class Meta:
        model = Item
        fields = [
            'type', 'category', 'description', 'brand', 'color',
            'location', 'date', 'time', 'image', 'contact_email', 'contact_phone'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class MatchItemSerializer(serializers.ModelSerializer):
    """Simplified serializer for items in match results."""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = ['id', 'category', 'description', 'location', 'date', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model."""
    lost_item = MatchItemSerializer(read_only=True)
    found_item = MatchItemSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'lost_item', 'found_item', 'match_score',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'read',
            'related_item', 'related_match', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ContactRequestSerializer(serializers.ModelSerializer):
    """Serializer for ContactRequest model."""
    item_category = serializers.CharField(source='item.category', read_only=True)
    item_type = serializers.CharField(source='item.type', read_only=True)
    item_location = serializers.CharField(source='item.location', read_only=True)
    item_contact_email = serializers.EmailField(source='item.contact_email', read_only=True)
    item_contact_phone = serializers.CharField(source='item.contact_phone', read_only=True)
    
    class Meta:
        model = ContactRequest
        fields = [
            'id', 'item', 'item_category', 'item_type', 'item_location', 
            'item_contact_email', 'item_contact_phone',
            'requester', 'status',
            'requester_message', 'requester_email', 'requester_phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requester', 'status', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['requester'] = user
        return super().create(validated_data)

