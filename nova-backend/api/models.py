"""
Django models for Nova Lost & Found application.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Extended user model."""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Item(models.Model):
    """Model for lost and found items."""
    
    TYPE_CHOICES = [
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('anonymous', 'Anonymous'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('matched', 'Matched'),
        ('recovered', 'Recovered'),
        ('closed', 'Closed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # AI matching fields
    ai_indexed = models.BooleanField(default=False)
    ai_index_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'status']),
            models.Index(fields=['user', 'type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.category} ({self.location})"


class Match(models.Model):
    """Model for AI-generated matches between lost and found items."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]
    
    lost_item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='lost_matches',
        limit_choices_to={'type': 'lost'}
    )
    found_item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='found_matches',
        limit_choices_to={'type': 'found'}
    )
    match_score = models.FloatField(help_text='AI similarity score (0-100)')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-match_score', '-created_at']
        unique_together = ['lost_item', 'found_item']
        indexes = [
            models.Index(fields=['lost_item', 'status']),
            models.Index(fields=['found_item', 'status']),
            models.Index(fields=['-match_score']),
        ]
    
    def __str__(self):
        return f"Match: {self.lost_item.category} ↔ {self.found_item.category} ({self.match_score:.1f}%)"


class Notification(models.Model):
    """Model for user notifications."""
    
    TYPE_CHOICES = [
        ('match_found', 'Match Found'),
        ('match_confirmed', 'Match Confirmed'),
        ('match_rejected', 'Match Rejected'),
        ('item_recovered', 'Item Recovered'),
        ('contact_request', 'Contact Request'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    
    # Optional related objects
    related_item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='notifications'
    )
    related_match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='notifications'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_type_display()}"


class ContactRequest(models.Model):
    """Contact request for anonymous items."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    ]
    
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='contact_requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_contact_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requester_message = models.TextField(blank=True, null=True)
    requester_email = models.EmailField()
    requester_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['item', 'status']),
            models.Index(fields=['requester', 'status']),
        ]
    
    def __str__(self):
        return f"Request for {self.item.category} by {self.requester.email}"

