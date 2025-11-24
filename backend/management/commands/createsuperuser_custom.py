"""
Django management command to create superuser
Usage: python manage.py createsuperuser_custom
"""
from django.core.management.base import BaseCommand
from authentication.models import User


class Command(BaseCommand):
    help = 'Create a superuser account'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address for the superuser',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username for the superuser',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the superuser',
        )
        parser.add_argument(
            '--noinput',
            action='store_true',
            help='Use provided arguments without prompting',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        username = options.get('username')
        password = options.get('password')
        noinput = options.get('noinput', False)

        if not noinput:
            if not email:
                email = input('Email: ').strip().lower()
            if not username:
                username = input('Username: ').strip()
            if not password:
                password = input('Password: ').strip()
                confirm_password = input('Confirm password: ').strip()
                if password != confirm_password:
                    self.stdout.write(self.style.ERROR('Passwords do not match!'))
                    return

        if not email or not username or not password:
            self.stdout.write(self.style.ERROR('All fields are required!'))
            return

        # Check if user already exists
        existing_user = User.objects(email=email).first()
        if existing_user:
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists.'))
            if not noinput:
                choice = input('Make this user a superuser? (y/n): ').strip().lower()
            else:
                choice = 'y'
            
            if choice == 'y':
                existing_user.is_superuser = True
                existing_user.is_staff = True
                existing_user.role = 'admin'
                existing_user.set_password(password)
                existing_user.is_verified = True
                existing_user.save()
                self.stdout.write(self.style.SUCCESS(f'✅ User {email} is now a superuser!'))
                return
            else:
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return

        # Create new superuser
        try:
            user = User.create_superuser(
                email=email,
                username=username,
                password=password,
                role='admin',
                is_verified=True
            )
            self.stdout.write(self.style.SUCCESS(f'\n✅ Superuser created successfully!'))
            self.stdout.write(f'   Username: {user.username}')
            self.stdout.write(f'   Email: {user.email}')
            self.stdout.write(f'   Is Superuser: {user.is_superuser}')
            self.stdout.write(f'   Is Staff: {user.is_staff}')
            self.stdout.write(f'   Role: {user.role}')
            self.stdout.write(self.style.SUCCESS(f'\n📝 You can now login at: http://localhost:5174/login'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error creating superuser: {str(e)}'))

