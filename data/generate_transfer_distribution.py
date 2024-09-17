import sqlite3
from collections import Counter

def analyze_transfer_distribution():
    conn = sqlite3.connect('./main.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT original_level, target_level 
        FROM transformations3
    ''')

    transfer_counter = Counter()
    total_count = 0

    for row in cursor:
        original_level, target_level = row
        transfer = f"{original_level}->{target_level}"
        transfer_counter[transfer] += 1
        total_count += 1

    conn.close()

    print("Transfer Distribution Overview:")
    print("-------------------------------")
    for transfer, count in transfer_counter.most_common():
        percentage = (count / total_count) * 100
        print(f"{transfer}: {count} ({percentage:.2f}%)")

    print(f"\nTotal entries: {total_count}")
    print(f"Unique transfer types: {len(transfer_counter)}")

if __name__ == '__main__':
    analyze_transfer_distribution()