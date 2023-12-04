import pandas as pd


def create_dept_csv(distribution_file, offered_dept_file, output_file):
    """
    Creates and saves a CSV file with departmental data.
    :param distribution_file: File path for the CSV containing distribution data.
    :param offered_dept_file: File path for the CSV containing offered department data.
    :param output_file: File path for the output CSV file.
    """
    # Load data from CSV files
    distribution_df = pd.read_csv(distribution_file)
    offered_dept_df = pd.read_csv(offered_dept_file)

    # Process and aggregate department data
    dept_data = distribution_df.groupby('Subject').agg({
        'GPA': lambda x: round(x.mean(), 2),
        'Subject': 'count',
        'Course No.': pd.Series.nunique
    }).rename(columns={
        'GPA': 'gpa',
        'Subject': 'past_classes',
        'Course No.': 'unique_classes'
    })
    dept_data['new_classes'] = 0

    # Reset index and merge with offered department data
    dept_data.reset_index(inplace=True)
    dept_data.rename(columns={'Subject': 'dept_id'}, inplace=True)
    dept_data = dept_data.merge(offered_dept_df, on='dept_id', how='left')
    dept_data['title'] = dept_data['title'].fillna('Discontinued')

    # Handle missing departments
    missing_depts = offered_dept_df[~offered_dept_df['dept_id'].isin(
        dept_data['dept_id'])]
    missing_dept_data = pd.DataFrame([{
        'dept_id': row['dept_id'],
        'title': row['title'],
        'gpa': 0,
        'past_classes': 0,
        'new_classes': 0,
        'unique_classes': 0
    } for _, row in missing_depts.iterrows()])

    dept_data = pd.concat([dept_data, missing_dept_data], ignore_index=True)

    # Save processed data to CSV
    dept_data.to_csv(output_file, index=False)


def load_valid_depts(dept_file):
    """
    Loads and returns a set of valid department IDs.
    :param dept_file: File path for the CSV file containing department data.
    :return: A set of valid department IDs.
    """
    dept_df = pd.read_csv(dept_file)
    return set(dept_df['dept_id'])


def create_instructor_csv(input_file, output_file, valid_depts):
    """
    Creates and saves a CSV file with instructor data.
    :param input_file: File path for the CSV file containing raw data.
    :param output_file: File path for the output CSV file.
    :param valid_depts: Set of valid department IDs to filter data.
    """
    df = pd.read_csv(input_file)
    df['instructor_id'] = df['Instructor'] + ' (' + df['Subject'] + ')'
    df = df[df['Subject'].isin(valid_depts)]

    # Process and aggregate instructor data
    instructor_data = df.groupby('instructor_id').agg({
        'Instructor': 'first',
        'Subject': 'first',
        'GPA': lambda x: round(x.mean(), 2),
        'Graded Enrollment': lambda x: round(x.mean(), 2),
        'Withdraws': lambda x: round(x.mean(), 2),
        'CRN': 'count'
    }).rename(columns={
        'Instructor': 'last_name',
        'Subject': 'dept',
        'GPA': 'gpa',
        'Graded Enrollment': 'enrollment',
        'Withdraws': 'withdraw',
        'CRN': 'past_classes'
    })
    instructor_data['new_classes'] = 0

    # Reset index and save data to CSV
    instructor_data.reset_index(inplace=True)
    instructor_data.to_csv(output_file, index=False)


def create_course_csv(input_file, output_file, valid_depts):
    """
    Creates and saves a CSV file with course data.
    :param input_file: File path for the CSV file containing raw data.
    :param output_file: File path for the output CSV file.
    :param valid_depts: Set of valid department IDs to filter data.
    """
    df = pd.read_csv(input_file)
    df['course_id'] = df['Subject'] + ' ' + df['Course No.'].astype(str)
    df = df[df['Subject'].isin(valid_depts)]

    # Custom function to determine the course title
    def determine_title(titles):
        if len(titles.unique()) > 1:
            return 'Special Study'
        else:
            return titles.iloc[0]

    # Process and aggregate course data
    course_data = df.groupby('course_id').agg({
        'Subject': 'first',
        'Course Title': determine_title,  # Use the custom function here
        'Credits': 'first',
        'GPA': lambda x: round(x.mean(), 2),
        'Graded Enrollment': lambda x: round(x.mean(), 2),
        'Withdraws': lambda x: round(x.mean(), 2),
        'CRN': 'count'
    }).rename(columns={
        'Subject': 'dept',
        'Course Title': 'title',
        'Credits': 'credits',
        'GPA': 'gpa',
        'Graded Enrollment': 'enrollment',
        'Withdraws': 'withdraw',
        'CRN': 'past_classes'
    })
    course_data['new_classes'] = 0

    # Reset index and save data to CSV
    course_data.reset_index(inplace=True)
    course_data.to_csv(output_file, index=False)


def load_valid_ids(file_path, column_name):
    """
    Loads and returns a set of valid IDs from a specified column in a CSV file.
    :param file_path: File path for the CSV file.
    :param column_name: Name of the column to extract IDs from.
    :return: A set of valid IDs.
    """
    df = pd.read_csv(file_path)
    return set(df[column_name])


def create_past_instance_csv(input_file, course_file, instructor_file, output_file):
    """
    Creates and saves a CSV file with past course instance data.
    :param input_file: File path for the CSV file containing raw data.
    :param course_file: File path for the CSV file containing course data.
    :param instructor_file: File path for the CSV file containing instructor data.
    :param output_file: File path for the output CSV file.
    """
    df = pd.read_csv(input_file)

    # Load valid foreign keys
    valid_course_ids = load_valid_ids(course_file, 'course_id')
    valid_instructor_ids = load_valid_ids(instructor_file, 'instructor_id')

    # Create 'instance_id', 'course_id', and 'instructor_id'
    df['instance_id'] = df['Academic Year'] + \
        df['Term'] + df['CRN'].astype(str)
    df['course_id'] = df['Subject'] + ' ' + df['Course No.'].astype(str)
    df['instructor_id'] = df['Instructor'] + ' (' + df['Subject'] + ')'

    # Filter based on valid foreign keys
    df = df[df['course_id'].isin(valid_course_ids) &
            df['instructor_id'].isin(valid_instructor_ids)]

    # Prepare and save past instance data
    past_instance_data = df[['instance_id', 'course_id', 'instructor_id',
                             'Academic Year', 'Term', 'CRN', 'GPA',
                             'Withdraws', 'Graded Enrollment']].rename(columns={
                                 'Academic Year': 'year',
                                 'Term': 'term',
                                 'CRN': 'crn',
                                 'GPA': 'gpa',
                                 'Withdraws': 'withdraw',
                                 'Graded Enrollment': 'enrollment'
                             })

    # Write to CSV
    past_instance_data.to_csv(output_file, index=False)


def create_instructor_course_stats_csv(input_file, course_file, instructor_file, output_file):
    """
    Creates and saves a CSV file with statistics for each instructor-course combination.
    This method processes the raw data to calculate average GPA, enrollment, and withdrawals
    for each course taught by each instructor.

    :param input_file: File path for the CSV file containing raw data.
    :param course_file: File path for the CSV file containing course data.
    :param instructor_file: File path for the CSV file containing instructor data.
    :param output_file: File path for the output CSV file.
    """
    df = pd.read_csv(input_file)

    # Load valid course and instructor IDs to ensure data integrity
    valid_course_ids = load_valid_ids(course_file, 'course_id')
    valid_instructor_ids = load_valid_ids(instructor_file, 'instructor_id')

    # Generate 'course_id' and 'instructor_id' for each entry in the dataframe
    df['course_id'] = df['Subject'] + ' ' + df['Course No.'].astype(str)
    df['instructor_id'] = df['Instructor'] + ' (' + df['Subject'] + ')'

    # Filter out invalid course and instructor IDs
    df = df[df['course_id'].isin(valid_course_ids) &
            df['instructor_id'].isin(valid_instructor_ids)]

    # Aggregate data to calculate statistics for each instructor-course pair
    instructor_course_stats = df.groupby(['instructor_id', 'course_id']).agg({
        'GPA': lambda x: round(x.mean(), 2),  # Calculate average GPA
        # Calculate average graded enrollment
        'Graded Enrollment': lambda x: round(x.mean(), 2),
        # Calculate average number of withdrawals
        'Withdraws': lambda x: round(x.mean(), 2),
        'CRN': 'count'  # Count the number of instances
    }).rename(columns={
        'GPA': 'gpa',
        'Graded Enrollment': 'enrollment',
        'Withdraws': 'withdraw',
        'CRN': 'past_classes'
    }).reset_index()

    # Generate a unique statistic ID for each instructor-course pair
    instructor_course_stats['stat_id'] = instructor_course_stats['instructor_id'] + \
        ' ' + instructor_course_stats['course_id']

    # Rearrange the columns for clearer presentation
    instructor_course_stats = instructor_course_stats[[
        'stat_id', 'course_id', 'instructor_id', 'gpa', 'enrollment', 'withdraw', 'past_classes']]

    # Write the processed data to a CSV file
    instructor_course_stats.to_csv(output_file, index=False)


def main():
    create_dept_csv('raw_data/distribution.csv',
                    'raw_data/offered_dept.csv', 'cleaned_data/dept.csv')
    valid_depts = load_valid_depts('cleaned_data/dept.csv')
    create_instructor_csv('raw_data/distribution.csv',
                          'cleaned_data/instructor.csv', valid_depts)
    create_course_csv('raw_data/distribution.csv',
                      'cleaned_data/course.csv', valid_depts)
    create_past_instance_csv('raw_data/distribution.csv',
                             'cleaned_data/course.csv',
                             'cleaned_data/instructor.csv',
                             'cleaned_data/past_instance.csv')
    create_instructor_course_stats_csv('raw_data/distribution.csv',
                                       'cleaned_data/course.csv',
                                       'cleaned_data/instructor.csv',
                                       'cleaned_data/instructor_course_stats.csv')


if __name__ == "__main__":
    main()
