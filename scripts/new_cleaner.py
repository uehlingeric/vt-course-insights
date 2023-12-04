import csv


def read_instructors(file_path):
    """
    Reads instructor data from a CSV file and creates a dictionary for quick lookups.
    This dictionary is keyed by a tuple of department and a variation of the instructor's last name,
    allowing for flexible matching of instructor names in different formats.

    :param file_path: The file path of the CSV file containing instructor data.
    :return: A dictionary where keys are tuples of (department, instructor_name_variation)
             and values are the corresponding instructor IDs.
    """
    instructors = {}
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Create different name variations for matching (case-insensitive)
            last_name = row['last_name'].lower()
            names = [last_name] + last_name.split('-') + last_name.split(' ')
            for name in names:
                key = (row['dept'], name)
                instructors[key] = row['instructor_id']
    return instructors


def add_new_instructor(instructor_name, dept, instructors_lookup, instructors_file):
    """
    Adds a new instructor to the instructor CSV file and updates the lookup dictionary.
    This method is used when an instructor is encountered in the data that is not already
    in the instructor lookup.

    :param instructor_name: The name of the instructor to be added.
    :param dept: The department of the instructor.
    :param instructors_lookup: The dictionary used for instructor lookups.
    :param instructors_file: The file path of the instructor CSV file where new instructor data will be appended.
    :return: The newly created instructor ID.
    """
    # Retain original capitalization for last_name
    last_name_original = ' '.join(instructor_name.split(
    )[1:]) if ' ' in instructor_name else instructor_name
    last_name_key = last_name_original.lower()  # Use lowercased version for key
    instructor_id = f"{last_name_original} ({dept})"

    # Check if instructor already exists in the lookup
    if (dept, last_name_key) in instructors_lookup:
        return instructors_lookup[(dept, last_name_key)]

    # Add instructor to the lookup
    instructors_lookup[(dept, last_name_key)] = instructor_id
    # Write the new instructor to the file
    with open(instructors_file, 'a', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=[
                                'instructor_id', 'last_name', 'dept', 'gpa', 'enrollment', 'withdraw', 'past_classes', 'new_classes'])
        writer.writerow({
            'instructor_id': instructor_id, 'last_name': last_name_original, 'dept': dept,
            'gpa': 0.0, 'enrollment': 0.0, 'withdraw': 0.0, 'past_classes': 0, 'new_classes': 0
        })
    return instructor_id


def standardize_instructor(instructor_name, dept, instructors_lookup):
    """
    Standardizes the instructor name by removing initials and converting it to lowercase.
    This method also checks the instructors_lookup to find a matching instructor ID.
    If no match is found, it returns None.

    :param instructor_name: The name of the instructor to standardize.
    :param dept: The department of the instructor.
    :param instructors_lookup: The lookup dictionary containing instructor IDs.
    :return: The standardized instructor ID if a match is found, otherwise None.
    """
    last_name = ' '.join(instructor_name.split()[1:]).lower(
    ) if ' ' in instructor_name else instructor_name.lower()
    # Check various name iterations
    for name in [last_name, last_name.replace(' ', '-'), last_name.replace('-', ' ')]:
        key = (dept, name)
        if key in instructors_lookup:
            return instructors_lookup[key]
    return None  # No match found


def standardize_modality(modality):
    """
    Standardizes the modality value from the raw data to a predefined set of short forms.
    This method maps longer modality descriptions to concise, standardized abbreviations.

    :param modality: The modality value as it appears in the raw data.
    :return: A standardized short form of the modality.
    """
    return {
        'Face to Face Instruction': 'F2F',
        'Hybrid (F2F & Online Instruc.)': 'Hybrid',
        'Online with Synchronous Mtgs.': 'OnlineSync',
        'Online: Asynchronous': 'OnlineAsync',
        '': 'F2F'
    }.get(modality, modality)


def get_department(course):
    """
    Extracts the department code from the course value.
    This is typically the first part of the course string.

    :param course: The full course string (e.g., 'MATH 101').
    :return: The department code (e.g., 'MATH').
    """
    return course.split()[0] if course else ''


def append_additional_times(initial_row, additional_row):
    """
    Appends additional time data to an existing course row.
    This method is used when a course has multiple meeting times and is crucial for capturing all
    the scheduling details for each course instance.

    :param initial_row: The initial course row dictionary to which additional times will be added.
    :param additional_row: The row containing the additional time data.
    """
    mapped_additional_data = {
        'days': additional_row['cr_hrs'],
        'start_time': additional_row['capacity'],
        'end_time': additional_row['instructor'],
        'location': additional_row['days']
    }

    for key in ['days', 'start_time', 'end_time', 'location']:
        if initial_row.get(key):
            initial_row[key] += f" and {mapped_additional_data[key]}"
        else:
            initial_row[key] = mapped_additional_data[key]


def process_csv(input_filename, output_filename, instructors_file):
    """
    Processes the raw CSV file and outputs a cleaned and standardized version.
    This method reads course data, standardizes and enriches it with instructor IDs,
    modality abbreviations, and corrects any inconsistencies in time and location data.

    :param input_filename: The file path of the raw CSV file containing course data.
    :param output_filename: The file path where the processed data will be saved.
    :param instructors_file: The file path of the CSV file containing instructor data.
    """
    instructors_lookup = read_instructors(instructors_file)

    with open(input_filename, 'r') as infile, open(output_filename, 'w', newline='') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = ['crn', 'dept', 'course_id', 'instructor_id', 'title', 'modality',
                      'credits', 'capacity', 'days', 'start_time', 'end_time', 'location']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        last_non_additional_row = None

        for row in reader:
            try:
                credits = int(row['cr_hrs'])
                if credits == 0:  # Skip rows where credits is 0
                    continue

            except ValueError:  # If credits is not an integer, skip this row and continue with the next
                continue

            if row['modality'] == '* Additional Times *':  # Handle '* Additional Times *'
                if last_non_additional_row:
                    append_additional_times(last_non_additional_row, row)
                continue

            modality_standardized = standardize_modality(row['modality'])
            department = get_department(row['course'])

            if row['days'] == '(ARR)':  # Handle '(ARR)' in Days
                row['start_time'], row['end_time'] = '(ARR)', '(ARR)'

            standardized_instructor_id = standardize_instructor(
                row['instructor'], department, instructors_lookup)

            if standardized_instructor_id is None:  # Add new instructor if no match
                standardized_instructor_id = add_new_instructor(
                    row['instructor'], department, instructors_lookup, instructors_file)

            row['instructor'] = standardized_instructor_id

            new_row = {
                'crn': row['crn'],
                'dept': department,
                'course_id': row['course'],
                'instructor_id': standardized_instructor_id,
                'title': row['title'],
                'modality': modality_standardized,
                'credits': row['cr_hrs'],
                'capacity': row['capacity'],
                'days': row['days'],
                'start_time': row['start_time'],
                'end_time': row['end_time'],
                'location': row['location']
            }

            if last_non_additional_row:
                writer.writerow(last_non_additional_row)

            last_non_additional_row = new_row

        if last_non_additional_row:
            writer.writerow(last_non_additional_row)


def main():
    process_csv('raw_data/offered_raw.csv',
                'cleaned_data/new_instance.csv', 'cleaned_data/instructor.csv')


if __name__ == "__main__":
    main()
