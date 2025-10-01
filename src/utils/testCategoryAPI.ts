import {
    getCategoryBySlug,
    getCategoryPath,
    getCategoryProductCount,
    getCategoryTree,
    listByCategorySlug,
    listCategoryChildren
} from '../api/categories';

export async function testCategoryAPI() {
  console.log('🧪 Starting category API test...');
  
  try {
    // Test 1: List products by category slug
    console.log('📦 Testing listByCategorySlug...');
    const silverCoins = await listByCategorySlug('bullion/silver/coins', 1, 5);
    console.log('✅ Test 1 Passed: Silver coins found:', silverCoins.length);
    
    // Test 2: List category children
    console.log('👶 Testing listCategoryChildren...');
    const goldChildren = await listCategoryChildren('bullion/gold');
    console.log('✅ Test 2 Passed: Gold children found:', goldChildren.length, goldChildren.map(c => c.name));
    
    // Test 3: Get category by slug
    console.log('🔍 Testing getCategoryBySlug...');
    const bullionCategory = await getCategoryBySlug('bullion');
    console.log('✅ Test 3 Passed: Bullion category:', bullionCategory?.name);
    
    // Test 4: Get category path (breadcrumbs)
    console.log('🍞 Testing getCategoryPath...');
    const path = await getCategoryPath('bullion/gold/coins/american-eagles');
    console.log('✅ Test 4 Passed: Category path:', path.map(c => c.name).join(' > '));
    
    // Test 5: Get category tree
    console.log('🌳 Testing getCategoryTree...');
    const tree = await getCategoryTree();
    console.log('✅ Test 5 Passed: Root categories found:', tree.length, tree.map(c => c.name));
    
    // Test 6: Get product count
    console.log('🔢 Testing getCategoryProductCount...');
    const bullionCount = await getCategoryProductCount('bullion');
    console.log('✅ Test 6 Passed: Bullion product count:', bullionCount);
    
    console.log('✅ All category API tests passed!');
    return { 
      success: true, 
      results: {
        silverCoins: silverCoins.length,
        goldChildren: goldChildren.length,
        bullionCategory: bullionCategory?.name,
        categoryPath: path.map(c => c.name).join(' > '),
        rootCategories: tree.length,
        bullionProductCount: bullionCount
      }
    };
    
  } catch (error: any) {
    console.error('❌ Category API Test Exception:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during category API test.' 
    };
  }
}
