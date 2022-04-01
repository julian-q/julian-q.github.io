from datetime import date

with open('log.html', 'r') as log_file:
    html = log_file.read()

end_of_body = html.find('</body>')
log_date = date.today().strftime('%d-%m-%Y')
new_entry = f"""    <p class="entrylink" onclick="toggleEntry('{log_date}')">{log_date}</p>
    <div id="{log_date}" class="entry">
        <p></p>
    </div>
"""
html = html[:end_of_body] + new_entry + html[end_of_body:]

with open('log.html', 'w') as log_file:
    log_file.write(html)
