"""
Shared pytest fixtures.

DRF's rate throttles are cache-backed. Django's TestCase wraps each test
in a DB transaction that rolls back automatically, but the cache is a
separate store that is NOT part of that transaction — so without this,
throttle counters (and anything else cached) would leak between test
methods and produce flaky 429s unrelated to whatever the test is actually
checking. This does not change throttle behavior in dev/production, only
test isolation.
"""
import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _clear_cache_between_tests():
    cache.clear()
    yield
    cache.clear()
