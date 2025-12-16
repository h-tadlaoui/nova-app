from django.core.management.base import BaseCommand
from api.models import Item
from api.views import ItemViewSet
import time

class Command(BaseCommand):
    help = 'Re-indexes all items to the AI service'

    def handle(self, *args, **options):
        items = Item.objects.all()
        count = items.count()
        self.stdout.write(f"Found {count} items to re-index...")

        viewset = ItemViewSet()
        
        success = 0
        failed = 0

        for item in items:
            try:
                self.stdout.write(f"Indexing item {item.id} ({item.title if hasattr(item, 'title') else item.description[:20]})...")
                # We reuse the helper method from ItemViewSet
                # Note: ItemViewSet methods typically expect 'self.request' or similar context
                # but _index_item_in_ai seems self-contained or relies on settings.
                # Let's check if it needs 'self.request'. 
                # Checking source code from memory: It uses settings.AI_SERVICE_URL. It doesn't use request.
                
                viewset._index_item_in_ai(item)
                success += 1
                # Small delay to not overwhelm AI
                time.sleep(0.1)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to index item {item.id}: {str(e)}"))
                failed += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully re-indexed {success} items. Failed: {failed}"))
