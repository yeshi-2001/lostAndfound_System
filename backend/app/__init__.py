from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:yeshika@localhost:5432/lost_found_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    # Test database connection
    with app.app_context():
        try:
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("Database connection successful!")
            print(f"Connected to: {app.config['SQLALCHEMY_DATABASE_URI']}")
        except Exception as e:
            print("Database connection failed!")
            print(f"Error: {str(e)}")
            print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.found_items import found_items_bp
    from app.routes.lost_items import lost_items_bp
    from app.routes.matches import matches_bp
    from app.routes.notifications import notifications_bp
    from app.routes.profile import profile_bp
    from app.routes.form_options import form_options_bp
    from app.routes.verification import verification_bp
    from app.routes.returns import returns_bp
    from app.routes.admin import admin_bp
    from app.routes.deletion import deletion_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(found_items_bp, url_prefix='/api/found-items')
    app.register_blueprint(lost_items_bp, url_prefix='/api/lost-items')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(form_options_bp, url_prefix='/api')
    app.register_blueprint(verification_bp, url_prefix='/api/verification')
    app.register_blueprint(returns_bp, url_prefix='/api/returns')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(deletion_bp, url_prefix='/api')
    
    # Log all requests
    @app.before_request
    def log_request():
        from flask import request
        print(f"{request.method} {request.path} - Frontend connected")
    
    # ADDED: Route to serve locally stored images (replaces AWS S3 URLs)
    # This allows images to be accessed via /uploads/filename.jpg
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)
    
    return app