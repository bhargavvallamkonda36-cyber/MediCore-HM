# MediCore HMS — Frontend Search & Usability Test Checklist

Run the frontend from `D:\MediCore\frontend` and backend from `D:\MediCore\backend`.

## Doctors (`/doctors`)
- [ ] Search by first name, last name, email, specialization, and department.
- [ ] Search is case-insensitive and trims leading/trailing spaces.
- [ ] No-match search shows a friendly empty result.
- [ ] Clear search restores all rows.
- [ ] Total and active counts remain correct when filtering.
- [ ] Add Doctor validates required fields and displays API errors.
- [ ] Status toggle updates the backend and remains correct after refresh.
- [ ] Only authorized roles can see/use management actions; backend also enforces this.
- [ ] Table remains usable on narrow screens (horizontal scroll or responsive layout).

## Every list page
- [ ] Loading state appears while data is fetched.
- [ ] Empty state appears when there are no records.
- [ ] API/network errors are visible and provide a retry path where practical.
- [ ] Search and filters do not mutate or delete source records.
- [ ] Long values wrap or truncate without breaking the layout.
- [ ] Forms disable submit while saving to prevent accidental duplicates.
- [ ] Success messages appear only after the server confirms success.

## Cross-page regression
- [ ] Login/logout and session expiry.
- [ ] Dashboard statistics.
- [ ] Departments, patients, doctors, appointments.
- [ ] Medical records, medications, prescriptions.
- [ ] Invoices and payments, including partial payments.
- [ ] Profile page.
- [ ] Test at desktop and mobile widths.
