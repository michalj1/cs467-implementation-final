import numpy as np

xmin = -250
xmax = 250
ymin = -52
ymax = 418

attributes = ['Player Name', 'Team Name', 'Game Date', 'X Location', 'Y Location', 'Shot Made Flag']

# Function to process line and extract required attributes
def process_line(line):
    parts = line.strip().split(',')
    attributes_values = [parts[header.index(attr)] for attr in attributes]
    return attributes_values

# Filter and extract required attributes
shots_data = []

with open("static/data/NBA Shot Locations 1997 - 2020.csv", 'r', encoding="utf-8") as file:
    header = file.readline().strip().split(',')
    header_indices = {attr: header.index(attr) for attr in attributes}
    
    for line in file:
        data = process_line(line)
        shots_data.append(data)

# Write filtered data to new CSV
with open("shots.csv", 'w', encoding='utf-8') as file:
    file.write(','.join(attributes) + '\n')
    for data in shots_data:
        file.write(','.join(data) + '\n')
