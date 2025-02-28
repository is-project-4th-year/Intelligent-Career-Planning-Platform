import csv
from django.core.management.base import BaseCommand
from api.models import University  # Import your University model

class Command(BaseCommand):
    help = "Load universities from a CSV file into the database"

    def handle(self, *args, **kwargs):
        file_path = "universities.csv"  # Ensure this file is in your Django project root

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                reader = csv.reader(file)
                next(reader)  # Skip header row
                count = 0

                for row in reader:
                    university_name = row[1].strip()  # Adjust index based on CSV structure
                    if university_name:
                        _, created = University.objects.get_or_create(name=university_name)
                        if created:
                            count += 1

                self.stdout.write(self.style.SUCCESS(f"Successfully added {count} universities."))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File '{file_path}' not found."))
