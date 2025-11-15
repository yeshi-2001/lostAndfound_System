#!/usr/bin/env python3
"""
Update last_login for existing users to test welcome messages
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from datetime import datetime, timedelta

def update_user_last_login():
    app = create_app()
    
    with app.app_context():
        try:
            # Get all users
            users = User.query.all()
            print(f"Found {len(users)} users")
            
            for i, user in enumerate(users):
                # Set different last_login times for testing
                if i == 0:
                    # First user: 2 days ago
                    user.last_login = datetime.utcnow() - timedelta(days=2)
                elif i == 1:
                    # Second user: 1 week ago
                    user.last_login = datetime.utcnow() - timedelta(weeks=1)
                else:
                    # Other users: 1 day ago
                    user.last_login = datetime.utcnow() - timedelta(days=1)
                
                print(f"Updated {user.name} - last_login: {user.last_login}")
            
            db.session.commit()
            print("Successfully updated all users' last_login timestamps")
            
        except Exception as e:
            print(f"Error updating users: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    update_user_last_login()