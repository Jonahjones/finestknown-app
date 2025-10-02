import { supabase } from '@/src/lib/supabase';
import { titleMatchesSlug } from '@/src/utils/url';

export interface Article {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: 'Market' | 'Education' | 'Ancients' | 'Treasure' | 'Collectibles' | 'Goldbacks' | 'Authentication' | 'Storage';
  author: string;
  read_minutes: number;
  cover_url: string | null;
  body_md: string;
  published_at: string;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  resource_type?: string | null;
  display_date?: string | null;
}

export interface ListArticlesParams {
  category?: Article['category'];
  limit?: number;
  offset?: number;
}

/**
 * List articles with optional category filtering
 */
export async function listArticles(params: ListArticlesParams = {}) {
  const { category, limit = 20, offset = 0 } = params;
  
  console.log('📰 listArticles: Starting with params:', params);
  
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ listArticles error:', error);
      throw error;
    }
    
    console.log('✅ listArticles: Found', data?.length, 'articles');
    console.log('📰 listArticles: Sample titles:', data?.slice(0, 3).map(a => a.title));
    return { articles: data || [], total: count || 0 };
  } catch (error) {
    console.error('❌ listArticles exception:', error);
    throw error;
  }
}

/**
 * Get a single article by ID or slug (supports UUID, database slug, and title-based slug)
 */
export async function getArticle(idOrSlug: string) {
  console.log('📖 getArticle: Fetching article with:', idOrSlug);

  try {
    // Check if input looks like a UUID (contains dashes in UUID pattern)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let data, error;

    if (isUUID) {
      // Try to find by ID first
      console.log('📖 getArticle: Looks like UUID, trying ID lookup...');
      const result = await supabase
        .from('articles')
        .select('*')
        .eq('id', idOrSlug)
        .single();
      
      data = result.data;
      error = result.error;
      
      if (data) {
        console.log('✅ getArticle: Found article by ID:', data.title);
        return data;
      }
    }

    // If not found by ID or not a UUID, try to find by database slug
    console.log('📖 getArticle: Trying slug lookup...');
    const slugResult = await supabase
      .from('articles')
      .select('*')
      .eq('slug', idOrSlug)
      .single();
    
    data = slugResult.data;
    error = slugResult.error;

    // If not found by slug, try to find by title pattern
    if (error && error.code === 'PGRST116') {
      console.log('📖 getArticle: Not found by slug, trying title pattern...');
      
      // Get all articles and find by title match
      const { data: allArticles, error: allError } = await supabase
        .from('articles')
        .select('*');

      if (allError) {
        console.error('❌ getArticle error fetching all articles:', allError);
        throw allError;
      }

      // Find article where title matches the slug
      const matchingArticle = allArticles?.find(article => 
        titleMatchesSlug(article.title, idOrSlug)
      );

      if (matchingArticle) {
        data = matchingArticle;
        error = null;
        console.log('✅ getArticle: Found article by title match:', matchingArticle.title);
      } else {
        console.warn('⚠️ getArticle: Article not found for:', idOrSlug);
        throw new Error('Article not found');
      }
    } else if (error) {
      console.error('❌ getArticle error:', error);
      throw error;
    }

    if (!data) {
      console.warn('⚠️ getArticle: Article not found for:', idOrSlug);
      throw new Error('Article not found');
    }

    console.log('✅ getArticle: Found article:', data.title);
    return data;
  } catch (error) {
    console.error('❌ getArticle exception:', error);
    throw error;
  }
}

/**
 * List featured articles
 */
export async function listFeaturedArticles(limit = 3) {
  console.log('⭐ listFeaturedArticles: Starting with limit:', limit);
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ listFeaturedArticles error:', error);
      throw error;
    }
    
    console.log('✅ listFeaturedArticles: Found', data?.length, 'featured articles');
    console.log('⭐ listFeaturedArticles: Titles:', data?.map(a => a.title));
    return data || [];
  } catch (error) {
    console.error('❌ listFeaturedArticles exception:', error);
    throw error;
  }
}

/**
 * List resource articles by resource type
 */
export async function listResourceArticles(resourceType: string, limit = 20) {
  console.log('📚 listResourceArticles: Starting for type:', resourceType);
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('resource_type', resourceType)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ listResourceArticles error:', error);
      throw error;
    }
    
    console.log('✅ listResourceArticles: Found', data?.length, 'articles for', resourceType);
    return data || [];
  } catch (error) {
    console.error('❌ listResourceArticles exception:', error);
    throw error;
  }
}

// Available article categories
export const ARTICLE_CATEGORIES = [
  'Market',
  'Education', 
  'Ancients',
  'Treasure',
  'Collectibles',
  'Goldbacks',
  'Authentication',
  'Storage'
] as const;

export type ArticleCategory = typeof ARTICLE_CATEGORIES[number];