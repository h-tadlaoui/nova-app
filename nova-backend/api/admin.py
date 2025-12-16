"""
Django admin configuration for Nova Lost & Found.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Item, Match, Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for User model."""
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone',)}),
    )


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    """Admin for Item model."""
    list_display = ['id', 'type', 'category', 'location', 'status', 'user', 'created_at']
    list_filter = ['type', 'status', 'category', 'created_at']
    search_fields = ['category', 'description', 'brand', 'location', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'ai_indexed', 'ai_index_id']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'type', 'category', 'description')
        }),
        ('Details', {
            'fields': ('brand', 'color', 'location', 'date', 'time')
        }),
        ('Status', {
            'fields': ('status', 'image')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone')
        }),
        ('AI Indexing', {
            'fields': ('ai_indexed', 'ai_index_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Admin for Match model."""
    list_display = ['id', 'lost_item', 'found_item', 'match_score', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = [
        'lost_item__category', 'lost_item__description',
        'found_item__category', 'found_item__description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Match Information', {
            'fields': ('lost_item', 'found_item', 'match_score', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for Notification model."""
    list_display = ['id', 'user', 'type', 'title', 'read', 'created_at']
    list_filter = ['type', 'read', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Information', {
            'fields': ('user', 'type', 'title', 'message', 'read')
        }),
        ('Related Objects', {
            'fields': ('related_item', 'related_match'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
