<?php
/*
 * Formular-Versand für IONOS-Webhosting (ersetzt Netlify Forms).
 * Nimmt Schadensmeldung, Rückruf, Wunschtermin und Bewerbung an und schickt sie per E-Mail,
 * hochgeladene Fotos und Unterlagen als Anhang.
 * Anpassen: EMPFAENGER (wer die Anfragen bekommt) und ABSENDER (Adresse der eigenen Domain, sonst
 * stellt IONOS die Mail nicht zu).
 */

date_default_timezone_set('Europe/Berlin');

const EMPFAENGER = 'hallo@taeubert-karosserie-lack.de';
const ABSENDER = 'website@taeubert-karosserie-lack.de';
const MAX_DATEI = 8 * 1024 * 1024;     // je Datei
const MAX_GESAMT = 20 * 1024 * 1024;   // alle Dateien zusammen

// Formulare: Betreff und Danke-Seite
$FORMULARE = [
    'schadensmeldung' => ['Schadensmeldung', 'danke.html'],
    'rueckruf'        => ['Rückrufwunsch', 'danke.html'],
    'wunschtermin'    => ['Wunschtermin', 'danke-termin.html'],
    'bewerbung'       => ['Bewerbung', 'danke-bewerbung.html'],
];
// Feldnamen -> Beschriftung in der E-Mail (Reihenfolge = Reihenfolge in der Mail)
$FELDER = [
    'name' => 'Name', 'telefon' => 'Telefon', 'email' => 'E-Mail', 'fahrzeug' => 'Fahrzeug',
    'leistung' => 'Leistung', 'schaden' => 'Anliegen', 'kostentraeger' => 'Wer zahlt',
    'datum' => 'Wunschdatum', 'ausweichdatum' => 'Ausweichdatum', 'tageszeit' => 'Tageszeit',
    'stelle' => 'Stelle', 'start' => 'Frühester Start', 'fuehrerschein' => 'Führerschein Klasse B',
    'ersatzwagen' => 'Ersatzwagen gewünscht', 'holservice' => 'Hol- und Bringservice gewünscht',
    'nachricht' => 'Nachricht',
];
$DATEIEN = ['foto1', 'foto2', 'foto3', 'lebenslauf', 'unterlagen'];
$ERLAUBT = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'application/pdf'];

$ajax = (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false);

function antwort($ok, $text, $weiter = null) {
    global $ajax;
    if ($ajax) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'message' => $text]);
    } elseif ($ok && $weiter) {
        header('Location: ' . $weiter, true, 303);
    } else {
        http_response_code($ok ? 200 : 400);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8"><title>Anfrage</title><p>' . htmlspecialchars($text) .
             '</p><p><a href="javascript:history.back()">Zurück</a> · Telefon 03675 4289606</p>';
    }
    exit;
}
function feld($n) { return trim(str_replace(["\r", "\0"], '', (string)($_POST[$n] ?? ''))); }
function kopfzeile($s) { return preg_replace('/[\r\n]+/', ' ', $s); }   // keine Header-Injection

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: index.html', true, 303); exit; }

$form = feld('form-name');
if (!isset($FORMULARE[$form])) antwort(false, 'Unbekanntes Formular.');
[$titel, $danke] = $FORMULARE[$form];

// Spamschutz: verstecktes Feld muss leer bleiben (Bots füllen es aus) – dann still "erfolgreich" antworten
if (feld('firma') !== '') antwort(true, 'Danke.', $danke);

if (feld('name') === '' || feld('telefon') === '' || feld('einwilligung') === '') {
    antwort(false, 'Bitte Name, Telefonnummer und die Einwilligung zum Datenschutz angeben.');
}
$email = feld('email');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) antwort(false, 'Bitte eine gültige E-Mail-Adresse angeben.');

// Text der E-Mail
$zeilen = [];
foreach ($FELDER as $n => $label) {
    $v = feld($n);
    if ($v === '') continue;
    if ($v === 'ja' || $v === 'on') $v = 'ja';
    $zeilen[] = str_pad($label . ':', 34) . ($n === 'nachricht' ? "\n" . $v : $v);
}
$zeilen[] = '';
$zeilen[] = 'Gesendet am ' . date('d.m.Y \u\m H:i') . ' Uhr über das Formular „' . $titel . '“ der Website.';
$text = "Neue Anfrage: $titel\n\n" . implode("\n", $zeilen) . "\n";

// Anhänge prüfen
$anhaenge = [];
$gesamt = 0;
$finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
foreach ($DATEIEN as $n) {
    if (empty($_FILES[$n]) || $_FILES[$n]['error'] === UPLOAD_ERR_NO_FILE) continue;
    $f = $_FILES[$n];
    if ($f['error'] !== UPLOAD_ERR_OK) antwort(false, 'Eine Datei konnte nicht hochgeladen werden (zu groß?).');
    if ($f['size'] > MAX_DATEI) antwort(false, 'Eine Datei ist zu groß (max. 8 MB).');
    $gesamt += $f['size'];
    if ($gesamt > MAX_GESAMT) antwort(false, 'Die Dateien sind zusammen zu groß (max. 20 MB).');
    $typ = $finfo ? finfo_file($finfo, $f['tmp_name']) : ($f['type'] ?: 'application/octet-stream');
    if (!in_array($typ, $ERLAUBT, true)) antwort(false, 'Erlaubt sind nur Fotos und PDF-Dateien.');
    $name = preg_replace('/[^A-Za-z0-9._-]+/', '_', basename($f['name'])) ?: ($n . '.dat');
    $anhaenge[] = [$name, $typ, file_get_contents($f['tmp_name'])];
}

// E-Mail zusammenbauen (MIME, UTF-8)
$grenze = 'b_' . bin2hex(random_bytes(12));
$kopf = [
    'From: =?UTF-8?B?' . base64_encode('Website Täubert') . '?= <' . ABSENDER . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $grenze . '"',
];
if ($email !== '') $kopf[] = 'Reply-To: ' . kopfzeile(feld('name')) . ' <' . $email . '>';
$betreff = '=?UTF-8?B?' . base64_encode(kopfzeile("$titel: " . feld('name') . ' (' . feld('telefon') . ')')) . '?=';

$body = "--$grenze\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" .
        chunk_split(base64_encode($text)) . "\r\n";
foreach ($anhaenge as [$name, $typ, $daten]) {
    $body .= "--$grenze\r\nContent-Type: $typ; name=\"$name\"\r\nContent-Transfer-Encoding: base64\r\n" .
             "Content-Disposition: attachment; filename=\"$name\"\r\n\r\n" . chunk_split(base64_encode($daten)) . "\r\n";
}
$body .= "--$grenze--\r\n";

$ok = mail(EMPFAENGER, $betreff, $body, implode("\r\n", $kopf), '-f' . ABSENDER);
if (!$ok) antwort(false, 'Das Senden hat gerade nicht geklappt. Bitte rufen Sie uns an: 03675 4289606.');
antwort(true, 'Danke! Ihre Anfrage ist bei uns eingegangen.', $danke);
