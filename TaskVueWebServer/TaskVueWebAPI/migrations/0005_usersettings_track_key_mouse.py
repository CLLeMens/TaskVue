# Generated by Django 4.2.6 on 2023-11-15 19:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TaskVueWebAPI', '0004_alter_usergoals_friday_breaks_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersettings',
            name='track_key_mouse',
            field=models.BooleanField(default=False),
        ),
    ]
