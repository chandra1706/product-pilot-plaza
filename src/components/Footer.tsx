
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">ShopHub</h3>
            <p className="text-muted-foreground text-sm">
              Your one-stop destination for quality products at great prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary">Products</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-primary">Cart</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-primary">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=electronics" className="text-muted-foreground hover:text-primary">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-muted-foreground hover:text-primary">Clothing</Link></li>
              <li><Link to="/products?category=books" className="text-muted-foreground hover:text-primary">Books</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-muted-foreground">Help Center</span></li>
              <li><span className="text-muted-foreground">Contact Us</span></li>
              <li><span className="text-muted-foreground">Returns</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
