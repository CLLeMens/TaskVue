# Generated by Django 4.2.6 on 2023-11-19 14:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TaskVueWebAPI', '0006_processflow'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersettings',
            name='name',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
    ]
