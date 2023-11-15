# Generated by Django 4.2.6 on 2023-11-15 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TaskVueWebAPI', '0003_alter_usergoals_friday_breaks_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usergoals',
            name='friday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='friday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='friday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='monday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='monday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='monday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='saturday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='saturday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='saturday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='sunday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='sunday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='sunday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='thursday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='thursday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='thursday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='tuesday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='tuesday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='tuesday_workload',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='wednesday_breaks',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='wednesday_distractions',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='usergoals',
            name='wednesday_workload',
            field=models.FloatField(null=True),
        ),
    ]