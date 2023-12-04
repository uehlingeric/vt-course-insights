import csv


def read_csv_to_dict(file_path, key_column):
    """
    Reads a CSV file and converts it into a dictionary.
    Each row of the CSV file is stored as a dictionary entry with the value from 
    the specified key column as the key, and the entire row as the value.

    :param file_path: The path to the CSV file to be read.
    :param key_column: The column name in the CSV file to be used as the dictionary keys.
    :return: A dictionary representing the CSV data, keyed by the specified column.
    """
    data = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            key = row[key_column]
            data[key] = row
    return data


def increment_new_classes(data_dict, key):
    """
    Increments the 'new_classes' count by 1 for the specified key in the data dictionary.
    This is used to track the addition of new classes for departments, courses, or instructors.

    :param data_dict: The dictionary containing the data (departments, courses, or instructors).
    :param key: The key corresponding to the entry in the data dictionary to be incremented.
    """
    if key in data_dict:
        data_dict[key]['new_classes'] = str(
            int(data_dict[key].get('new_classes', '0')) + 1)


def update_csv_file(data_dict, file_path, fieldnames):
    """
    Writes the updated data from a dictionary back to a CSV file.
    This is used to save changes made to the data, such as incremented 'new_classes' counts.

    :param data_dict: The dictionary containing the updated data.
    :param file_path: The path to the CSV file where the data should be written.
    :param fieldnames: A list of fieldnames for the CSV file, indicating the order of columns.
    """
    with open(file_path, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in data_dict.values():
            writer.writerow(row)


def process_new_instance(new_instance_file, dept_file, course_file, instructor_file):
    """
    Processes a 'new instance' CSV file to increment the 'new_classes' counts for departments,
    courses, and instructors. This reflects the addition of new class instances in the respective
    data files.

    :param new_instance_file: The file path of the CSV containing new class instances.
    :param dept_file: The file path of the department CSV file to be updated.
    :param course_file: The file path of the course CSV file to be updated.
    :param instructor_file: The file path of the instructor CSV file to be updated.
    """
    depts = read_csv_to_dict(dept_file, 'dept_id')
    courses = read_csv_to_dict(course_file, 'course_id')
    instructors = read_csv_to_dict(instructor_file, 'instructor_id')

    with open(new_instance_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Increment new_classes for dept, course, and instructor
            increment_new_classes(depts, row['dept'])
            increment_new_classes(courses, row['course_id'])
            increment_new_classes(instructors, row['instructor_id'])

    # Update CSV files
    update_csv_file(depts, dept_file, depts[next(iter(depts))].keys())
    update_csv_file(courses, course_file, courses[next(iter(courses))].keys())
    update_csv_file(instructors, instructor_file,
                    instructors[next(iter(instructors))].keys())


def main():
    process_new_instance('cleaned_data/new_instance.csv', 'cleaned_data/dept.csv',
                         'cleaned_data/course.csv', 'cleaned_data/instructor.csv')


if __name__ == "__main__":
    main()
