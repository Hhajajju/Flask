from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import random
import string
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # SQLite database
app.config['TELEGRAM_TOKEN'] = os.getenv("TELEGRAM_TOKEN")  # Set a secret key for session management
db = SQLAlchemy(app)

# Load admin credentials from environment variables
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    telegram_id = db.Column(db.String(100), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    referral_code = db.Column(db.String(8), unique=True, nullable=False)
    referral_earnings = db.Column(db.Float, default=0.0)
    last_daily_claim = db.Column(db.Integer, default=0)  # Timestamp of the last daily claim

# Define the Withdrawal model
class Withdrawal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pending')  # Status can be 'Pending', 'Approved', or 'Rejected'
    user = db.relationship('User', backref='withdrawals')

# Initialize the database
db.create_all()

# Helper function to generate referral code
def generate_referral_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# Admin login route
@app.route('/admin', methods=['GET', 'POST'])
def admin():
    # Authenticate admin
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_authenticated'] = True
        else:
            return redirect(url_for('admin'))

    # Only show the admin dashboard if authenticated
    if not session.get('admin_authenticated'):
        return redirect(url_for('admin_login'))

    # Fetch users and withdrawals
    users = User.query.all()
    withdrawals = Withdrawal.query.all()
    return render_template('admin_dashboard.html', users=users, withdrawals=withdrawals)

# Admin logout route
@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_authenticated', None)
    return redirect(url_for('admin'))

# Admin approve withdrawal route
@app.route('/admin/approve_withdrawal/<int:withdrawal_id>', methods=['POST'])
def approve_withdrawal(withdrawal_id):
    withdrawal = Withdrawal.query.get(withdrawal_id)
    if withdrawal:
        withdrawal.status = 'Approved'
        user = withdrawal.user
        user.balance -= withdrawal.amount  # Deduct the amount from the user's balance
        db.session.commit()
    return redirect(url_for('admin'))

# Admin reject withdrawal route
@app.route('/admin/reject_withdrawal/<int:withdrawal_id>', methods=['POST'])
def reject_withdrawal(withdrawal_id):
    withdrawal = Withdrawal.query.get(withdrawal_id)
    if withdrawal:
        withdrawal.status = 'Rejected'
        db.session.commit()
    return redirect(url_for('admin'))

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# User registration route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        telegram_id = request.form['telegram_id']
        user = User.query.filter_by(telegram_id=telegram_id).first()

        if not user:
            referral_code = request.form['referral_code']
            new_user = User(
                telegram_id=telegram_id,
                referral_code=generate_referral_code(),
            )
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id  # Store user ID in session
        else:
            session['user_id'] = user.id  # Store user ID in session

        return redirect(url_for('dashboard'))

    return render_template('login.html')

# Dashboard route
@app.route('/dashboard')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    referral_link = f"https://t.me/yourbot?start={user.referral_code}"
    return render_template('dashboard.html', user=user, referral_link=referral_link)

# Claim daily reward route
@app.route('/claim_daily_reward')
def claim_daily_reward():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    current_time = int(time.time())

    if current_time - user.last_daily_claim >= 86400:  # 24 hours in seconds
        user.balance += 0.002  # Add daily reward
        user.last_daily_claim = current_time
        db.session.commit()

    return redirect(url_for('dashboard'))

# Watch ad route
@app.route('/watch_ad/<int:ad_id>')
def watch_ad(ad_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    user.balance += 0.005  # Add reward for watching ad
    db.session.commit()

    return redirect(url_for('dashboard'))

# Referral page route
@app.route('/referrals')
def referrals():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    referrals = User.query.filter_by(referral_code=user.referral_code).all()

    return render_template('referrals.html', referrals=referrals, user=user)

# Withdrawal page route
@app.route('/withdraw', methods=['POST'])
def withdraw():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    amount = float(request.form['amount'])
    address = request.form['address']

    if amount < 3.0:
        return jsonify({'message': 'Minimum withdrawal is $3.'}), 400

    if amount > user.balance:
        return jsonify({'message': 'Insufficient balance.'}), 400

    # Add withdrawal request
    withdrawal = Withdrawal(user_id=user.id, amount=amount, address=address)
    db.session.add(withdrawal)
    db.session.commit()

    return jsonify({'message': f'Withdrawal of ${amount} to {address} is pending.'})

if __name__ == '__main__':
    app.run(debug=True)
