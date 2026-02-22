import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { blogArticles } from '@/data/blogArticles';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const BlogPage = () => {
  useEffect(() => {
    axios.get(`${API}/analytics/page-views?page=blog`).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="min-h-screen py-12 px-6" data-testid="blog-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-mystic-purple/20 rounded-full text-mystic-purple text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Spiritual Insights & Guidance
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Wisdom from the <span className="gradient-text-gold">Stars</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Explore our collection of articles on psychic readings, astrology, love guidance, and spiritual healing. 
              Gain insights to illuminate your path.
            </p>
          </div>

          {/* Featured Article */}
          <Link to={`/blog/${blogArticles[0].slug}`} className="block mb-12 group">
            <Card className="glass rounded-2xl overflow-hidden hover:border-mystic-purple/50 transition-all" data-testid="featured-article">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img 
                    src={blogArticles[0].images[0].url} 
                    alt={blogArticles[0].images[0].alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-mystic-gold/20 text-mystic-gold border-mystic-gold/30">
                    Featured
                  </Badge>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4 group-hover:text-mystic-gold transition-colors">
                    {blogArticles[0].title}
                  </h2>
                  <p className="text-white/60 mb-6">{blogArticles[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blogArticles[0].date).toLocaleDateString('en-AU', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blogArticles[0].readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Article Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.slice(1).map((article, idx) => (
              <Link 
                key={article.id} 
                to={`/blog/${article.slug}`}
                className="group"
                data-testid={`article-card-${idx}`}
              >
                <Card className="glass rounded-2xl overflow-hidden h-full hover:border-mystic-purple/50 transition-all hover:scale-[1.02]">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.images[0].url} 
                      alt={article.images[0].alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 bg-mystic-purple/20 text-mystic-purple border-mystic-purple/30">
                      {article.category}
                    </Badge>
                    <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-mystic-gold transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1 text-mystic-gold group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* SEO-friendly bottom section */}
          <div className="mt-16 text-center">
            <Card className="glass rounded-2xl p-8 max-w-3xl mx-auto">
              <h2 className="font-serif text-2xl font-semibold mb-4">
                Your Guide to Spiritual Clarity in Dandenong
              </h2>
              <p className="text-white/60 mb-6">
                With over 248 five-star reviews, we've helped countless individuals across Melbourne and Victoria 
                find clarity through psychic readings, astrology consultations, love guidance, and spiritual healing. 
                Our articles share the wisdom we've gathered through years of practice.
              </p>
              <Link 
                to="/booking" 
                className="inline-flex items-center gap-2 text-mystic-gold hover:gap-3 transition-all"
              >
                Ready for a personal reading? Book Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
