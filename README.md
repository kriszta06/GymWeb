Documentație
Cuprins
Prezentare generală
Structura proiectului
Fluxuri principale (backend & frontend)
Autentificare și autorizare (JWT)
Funcționalități pentru Admin
Funcționalități pentru Client
Gestionarea utilizatorilor și parolelor
Programări (Bookings)
Clase și traineri
Pagina de profil
Securitate și bune practici
Extensibilitate și recomandări
Ghid de instalare și rulare
1. Prezentare generală
GymFit este o aplicație web pentru gestionarea unei săli de fitness, cu două tipuri principale de utilizatori: Admin și Client.
Adminul poate gestiona utilizatori, clase, traineri și programări.
Clientul se poate programa la clase, își poate vedea programările și își poate edita profilul.
2. Structura proiectului
Apply to appsettings....
Backend:
Controllers/: logica API (Auth, Users, Trainers, Classes, Bookings)
Models/: modele de date (User, Trainer, Class, Booking etc.)
Data/: contextul EF Core (GymFitContext)
Migrations/: migrații pentru baza de date
appsettings.json: configurări (conexiune DB, JWT etc.)
Frontend:
src/components/: componente React (Login, Register, Dashboards, Profile etc.)
App.js: rutare principală
public/: fișiere statice
3. Fluxuri principale
Backend (API REST)
Expune endpoint-uri pentru autentificare, gestionare utilizatori, clase, traineri, programări.
Folosește JWT pentru autentificare și politici de autorizare pentru roluri.
Frontend (React)
Pagini separate pentru login, register, dashboard admin/client, profil.
Navigare cu React Router.
Toate cererile către backend includ token-ul JWT pentru autentificare.
4. Autentificare și autorizare (JWT)
La login/register, backend-ul returnează un token JWT.
Tokenul conține: ID, email, nume, rol.
Tokenul este stocat în localStorage și trimis automat la fiecare request (header Authorization: Bearer ...).
Backend-ul validează tokenul la fiecare request protejat.
Politici de autorizare:
[Authorize(Policy = \"AdminOnly\")] pentru endpoint-uri de admin.
[Authorize] pentru endpoint-uri accesibile oricărui user logat.
5. Funcționalități pentru Admin
Dashboard admin: vizualizare și gestionare traineri, clase, utilizatori, programări.
Adăugare utilizator: dacă nu se specifică parolă, backend-ul generează una temporară și o afișează adminului într-un modal cu buton de copiere.
Nu poate edita parola utilizatorilor (doar la creare).
Poate șterge utilizatori, clase, traineri, programări.
6. Funcționalități pentru Client
Dashboard client: vizualizare traineri, clase disponibile, programările proprii.
Poate face programări la clase (dacă există locuri).
Poate anula programări.
Poate accesa pagina de profil pentru a-și edita datele și parola.
7. Gestionarea utilizatorilor și parolelor
La adăugare de către admin:
Dacă nu se specifică parolă, backend-ul generează una random și setează flagul MustChangePassword = true.
Parola temporară este afișată adminului într-un modal cu buton de copiere.
Adminul trebuie să comunice parola utilizatorului.
La prima logare, utilizatorul poate schimba parola din pagina de profil.
Adminul nu poate schimba parola altui utilizator (doar utilizatorul își poate schimba parola din profil).
8. Programări (Bookings)
Clientul poate face programări la clase disponibile.
Nu poate face două programări la aceeași clasă.
Poate anula programările proprii.
Adminul poate vedea toate programările.
9. Clase și traineri
Adminul poate adăuga, edita, șterge clase și traineri.
Clasele au: nume, descriere, dată/oră, trainer asociat.
Trainerii au: nume, specializare.
10. Pagina de profil
Orice utilizator (client sau admin) are acces la pagina de profil.
Poate edita: nume, email, parola proprie.
Buton „Înapoi la dashboard” pentru navigare rapidă.
Datele sunt încărcate din endpoint-ul /api/auth/me (userul curent).
11. Securitate și bune practici
Parolele sunt stocate doar hash-uite (BCrypt).
Tokenul JWT este validat la fiecare request.
Datele sensibile (parola, hash) nu sunt niciodată returnate în API.
Adminul nu poate vedea sau schimba parola altui utilizator.
Parola temporară este afișată doar o singură dată la creare și trebuie comunicată utilizatorului pe un canal securizat.
12. Extensibilitate și recomandări
Se poate adăuga trimitere automată a parolei temporare pe email (necesită setup SMTP).
Se pot adăuga notificări pentru programări, reminder email etc.
Se poate extinde cu funcționalități de plată, management abonamente, etc.
Se poate adăuga paginare, filtrare avansată, etc.
13. Ghid de instalare și rulare
Backend (.NET)
Asigură-te că ai .NET 6/7/8 SDK și PostgreSQL instalat.
Configurează conexiunea la baza de date în appsettings.Development.json.
Din terminal:
Apply to appsettings....
Frontend (React)
Asigură-te că ai Node.js și npm instalat.
Din terminal:
Apply to appsettings....
14. Cum funcționează token-urile JWT
La login/register, backend-ul creează un token JWT cu datele de identificare și rolul utilizatorului.
Tokenul este semnat cu o cheie secretă (configurată în backend).
La fiecare request protejat, frontend-ul trimite tokenul în headerul Authorization: Bearer ....
Backend-ul validează tokenul și extrage datele din el pentru a permite sau refuza accesul la resurse.
