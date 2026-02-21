import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, User, Star, Phone } from 'lucide-react';
import { blogArticles } from '@/data/blogArticles';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    const foundArticle = blogArticles.find(a => a.slug === slug);
    if (foundArticle) {
      setArticle(foundArticle);
      setRelatedArticles(blogArticles.filter(a => a.id !== foundArticle.id).slice(0, 2));
      axios.get(`${API}/analytics/page-views?page=blog-${slug}`).catch(() => {});
      window.scrollTo(0, 0);
    } else {
      navigate('/blog');
    }
  }, [slug, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!article) return null;

  // Convert markdown-style content to JSX
  const renderContent = (content) => {
    const lines = content.trim().split('\n');
    const elements = [];
    let currentIndex = 0;
    let imageInserted = false;

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        // Insert second image after first major section (after ~30% of content)
        if (!imageInserted && idx > lines.length * 0.3 && article.images[1]) {
          elements.push(
            <figure key={`img-${idx}`} className="my-10">
              <img 
                src={article.images[1].url} 
                alt={article.images[1].alt}
                className="w-full rounded-xl"
              />
              <figcaption className="text-center text-sm text-white/50 mt-3">
                {article.images[1].caption}
              </figcaption>
            </figure>
          );
          imageInserted = true;
        }
        elements.push(
          <h2 key={idx} className="font-serif text-2xl md:text-3xl font-semibold mt-12 mb-6 text-white">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="font-serif text-xl md:text-2xl font-semibold mt-8 mb-4 text-white">
            {trimmedLine.replace('### ', '')}
          </h3>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        elements.push(
          <p key={idx} className="font-semibold text-mystic-gold mt-6 mb-2">
            {trimmedLine.replace(/\*\*/g, '')}
          </p>
        );
      } else if (trimmedLine.startsWith('- ')) {
        elements.push(
          <li key={idx} className="text-white/80 ml-4 mb-2 list-disc list-inside">
            {trimmedLine.replace('- ', '')}
          </li>
        );
      } else if (trimmedLine.length > 0) {
        // Process inline bold
        const processedLine = trimmedLine.split(/(\*\*.*?\*\*)/).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-medium">{part.replace(/\*\*/g, '')}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={idx} className="text-white/70 leading-relaxed mb-4">
            {processedLine}
          </p>
        );
      }
      currentIndex++;
    });

    return elements;
  };

  return (
    <Layout>
      <article className="min-h-screen" data-testid="blog-article">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img 
            src={article.images[0].url} 
            alt={article.images[0].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark via-mystic-dark/50 to-transparent" />
          
          {/* Back button */}
          <Link 
            to="/blog" 
            className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            data-testid="back-to-blog"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
          {/* Meta */}
          <div className="mb-8">
            <Badge className="mb-4 bg-mystic-purple/20 text-mystic-purple border-mystic-purple/30">
              {article.category}
            </Badge>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('en-AU', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-mystic-gold transition-colors ml-auto"
                data-testid="share-btn"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Lead paragraph */}
          <p className="text-xl text-white/80 leading-relaxed mb-8 font-light">
            {article.excerpt}
          </p>

          {/* Article body */}
          <div className="prose prose-invert max-w-none">
            {renderContent(article.content)}
          </div>

          {/* CTA Card */}
          <Card className="glass rounded-2xl p-8 my-12 text-center" data-testid="article-cta">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-mystic-gold text-mystic-gold" />
              ))}
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3">
              Ready to Experience This for Yourself?
            </h3>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Join the 248+ people who have found clarity and guidance through our services. 
              Book your {article.category.toLowerCase()} today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/booking">
                <Button className="bg-mystic-purple hover:bg-mystic-purple/80 rounded-full px-8" data-testid="article-book-btn">
                  Book Your Reading
                </Button>
              </Link>
              <a href="tel:+61426272559">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 rounded-full px-8">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </Card>

          {/* Keywords for SEO (hidden visually but present for crawlers) */}
          <div className="sr-only">
            Keywords: {article.keywords.join(', ')}
          </div>
        </div>

        {/* Related Articles */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold mb-8 text-center">
            Continue Your Journey
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedArticles.map((related, idx) => (
              <Link 
                key={related.id} 
                to={`/blog/${related.slug}`}
                className="group"
                data-testid={`related-article-${idx}`}
              >
                <Card className="glass rounded-2xl overflow-hidden hover:border-mystic-purple/50 transition-all">
                  <div className="flex">
                    <div className="w-1/3 aspect-square">
                      <img 
                        src={related.images[0].url} 
                        alt={related.images[0].alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-6">
                      <Badge className="mb-2 text-xs bg-mystic-purple/20 text-mystic-purple border-mystic-purple/30">
                        {related.category}
                      </Badge>
                      <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-mystic-gold transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <span className="text-sm text-white/50 flex items-center gap-1">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogArticle;
