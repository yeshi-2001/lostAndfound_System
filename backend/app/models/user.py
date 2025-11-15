from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)  # Full name
    registration_number = db.Column(db.String(100), unique=True, nullable=False)  # Username/Student ID
    department = db.Column(db.String(100), nullable=False)  # Department
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)  # Phone number
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)  # Track last login for welcome messages
    
    # Relationships
    found_items = db.relationship('FoundItem', backref='user', lazy=True)
    lost_items = db.relationship('LostItem', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'registration_number': self.registration_number,
            'department': self.department,
            'email': self.email,
            'contact_number': self.contact_number,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }