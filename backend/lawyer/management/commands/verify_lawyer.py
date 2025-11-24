"""
Django management command to verify lawyers in MongoDB
Usage: python manage.py verify_lawyer <lawyer_email> [--status approved|rejected|pending]
"""
from django.core.management.base import BaseCommand, CommandError
from authentication.models import User
from lawyer.models import LawyerProfile
from datetime import datetime


class Command(BaseCommand):
    help = 'Verify or update lawyer verification status'

    def add_arguments(self, parser):
        parser.add_argument('lawyer_email', type=str, help='Email of the lawyer to verify')
        parser.add_argument(
            '--status',
            type=str,
            choices=['approved', 'rejected', 'pending'],
            default='approved',
            help='Verification status to set (default: approved)'
        )
        parser.add_argument(
            '--notes',
            type=str,
            default='',
            help='Verification notes'
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all lawyers with their verification status'
        )

    def handle(self, *args, **options):
        if options['list']:
            self.list_lawyers()
            return

        lawyer_email = options['lawyer_email']
        status = options['status']
        notes = options['notes']

        try:
            # Find the user
            user = User.objects.get(email=lawyer_email)
            
            if user.role != 'lawyer':
                raise CommandError(f'User {lawyer_email} is not a lawyer (role: {user.role})')

            # Get or create lawyer profile
            lawyer_profile, created = LawyerProfile.objects.get_or_create(user=user)
            
            if created:
                self.stdout.write(
                    self.style.WARNING(f'Created new lawyer profile for {lawyer_email}')
                )

            # Update verification status
            old_status = lawyer_profile.verification_status
            lawyer_profile.verification_status = status
            lawyer_profile.verified_at = datetime.utcnow() if status == 'approved' else None
            
            if notes:
                lawyer_profile.verification_notes = notes
            
            lawyer_profile.save()

            # Update user's lawyer verification status
            user.lawyer_verification_status = status
            user.is_lawyer_verified = (status == 'approved')
            if status == 'approved':
                user.lawyer_verified_at = datetime.utcnow()
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully updated lawyer {lawyer_email}:\n'
                    f'  Status: {old_status} -> {status}\n'
                    f'  Notes: {notes or "None"}'
                )
            )

        except User.DoesNotExist:
            raise CommandError(f'Lawyer with email {lawyer_email} not found')
        except Exception as e:
            raise CommandError(f'Error: {str(e)}')

    def list_lawyers(self):
        """List all lawyers with their verification status"""
        lawyers = User.objects.filter(role='lawyer')
        
        if not lawyers:
            self.stdout.write(self.style.WARNING('No lawyers found'))
            return

        self.stdout.write(self.style.SUCCESS(f'\nFound {lawyers.count()} lawyer(s):\n'))
        
        for lawyer in lawyers:
            try:
                profile = LawyerProfile.objects.get(user=lawyer)
                status = profile.verification_status
                status_style = {
                    'approved': self.style.SUCCESS,
                    'pending': self.style.WARNING,
                    'rejected': self.style.ERROR,
                }.get(status, self.style.NORMAL)
                
                self.stdout.write(
                    f"Email: {lawyer.email}\n"
                    f"Username: {lawyer.username}\n"
                    f"Name: {lawyer.name}\n"
                    f"Status: {status_style(status.upper())}\n"
                    f"License: {profile.license_number}\n"
                    f"Bar Council ID: {profile.bar_council_id}\n"
                    f"Specializations: {', '.join(profile.specializations) if profile.specializations else 'None'}\n"
                    f"---"
                )
            except LawyerProfile.DoesNotExist:
                self.stdout.write(
                    f"Email: {lawyer.email}\n"
                    f"Username: {lawyer.username}\n"
                    f"Status: {self.style.WARNING('NO PROFILE CREATED')}\n"
                    f"---"
                )

