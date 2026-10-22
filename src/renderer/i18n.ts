export type Language = 'ru' | 'en' | 'et';

export interface Translations {
  // Navigation
  navDashboard: string;
  navBells: string;
  navSchedule: string;
  navShortened: string;
  navSettings: string;

  // Days
  days: string[];
  daysShort: string[];
  today: string;
  todayActive: string;
  weekend: string;
  disabled: string;

  // Dashboard
  ringNow: string;
  stopRing: string;
  bellPlayingNow: string;
  systemRunning: string;
  todayIs: string;
  bellsCount: string;
  bellsDisabled: string;
  nextBell: string;
  inMinutesSeconds: (m: number, s: number) => string;
  lessonsFinished: string;
  mainMelody: string;
  daysOfWeekTitle: string;
  shortenedBadge: string;
  secondsSuffix: string;

  // Bells section
  bellsTitle: string;
  uploadSong: string;
  bellDuration: string;
  volume: string;
  repeatMelody: string;
  melodyLibrary: string;
  snippetBtn: string;
  selectBtn: string;
  selectedBtn: string;
  startSec: string;
  durationSec: string;
  doneBtn: string;
  snippetInfo: (start: number, end: number) => string;

  // Schedule & Shortened
  scheduleTitle: string;
  shortenedTitle: string;
  shortenedMode: string;
  shortenedDisabledMsg: string;
  shortenedActiveWarning: string;
  switchToRegularBtn: string;
  regularDisabledByShortened: string;
  editRegularAnyway: string;
  hideRegularSchedule: string;
  noBellsForDay: string;
  addBell: string;
  startLesson: string;
  endLesson: string;
  dragToReorder: string;
  copyToWeekdays: string;
  copySuccess: string;

  // Add / Edit Bell Modal
  newBellTitle: string;
  editBellTitle: string;
  bellNameLabel: string;
  bellNamePlaceholder: string;
  bellTimeLabel: string;
  bellTypeLabel: string;
  bellMelodyLabel: string;
  cancelBtn: string;
  saveBtn: string;
  lessonDefaultName: (num: number) => string;

  // Settings
  settingsTitle: string;
  saveSettings: string;
  savedNotification: string;
  languageLabel: string;
  languageDesc: string;
  darkModeLabel: string;
  darkModeDesc: string;
  autostartLabel: string;
  autostartDesc: string;
  systemVolumeLabel: string;
  audioOutputDeviceLabel: string;
  audioOutputDeviceDesc: string;
  defaultAudioDevice: string;
  testSoundBtn: string;
  testingSound: string;

  // Trim Audio Modal
  trimModalTitle: string;
  trimTrackSubtitle: string;
  trimWaveformLabel: string;
  trimStartTime: string;
  trimEndTime: string;
  trimDurationLabel: string;
  trimPlaySnippet: string;
  trimStopSnippet: string;
  trimPreset10s: string;
  trimPreset15s: string;
  trimPreset20s: string;
  trimPreset30s: string;
  trimPresetFull: string;
  trimSaveBtn: string;
  noMelodiesMsg: string;
  noMelodySelected: string;
  noMusicToRing: string;
  noMelodiesDashboard: string;

  // Default track names
  trackClassic: string;
  trackWestminster: string;
  trackGong: string;
  trackMarimba: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    navDashboard: 'Главная',
    navBells: 'Звонки',
    navSchedule: 'Расписание',
    navShortened: 'Сокращённые уроки',
    navSettings: 'Настройки',

    days: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    today: 'Сегодня',
    todayActive: 'Сегодня · Активный',
    weekend: 'Выходной день',
    disabled: 'Отключено',

    ringNow: 'Подать звонок',
    stopRing: 'Остановить звонок',
    bellPlayingNow: 'Сейчас играет звонок',
    systemRunning: 'Система работает',
    todayIs: 'Сегодня',
    bellsCount: 'звонков',
    bellsDisabled: 'Звонки отключены',
    nextBell: 'Следующий звонок',
    inMinutesSeconds: (m, s) => `через ${m} мин ${String(s).padStart(2, '0')} с`,
    lessonsFinished: 'Уроки закончены',
    mainMelody: 'Основная мелодия',
    daysOfWeekTitle: 'Дни недели',
    shortenedBadge: 'Сокращённый',
    secondsSuffix: 'сек',

    bellsTitle: 'Звонки',
    uploadSong: 'Загрузить песню',
    bellDuration: 'Длительность звонка',
    volume: 'Громкость',
    repeatMelody: 'Повторять мелодию',
    melodyLibrary: 'Мелодии звонка',
    snippetBtn: 'Отрезок',
    selectBtn: 'Выбрать',
    selectedBtn: 'Выбрана',
    startSec: 'Начало (сек):',
    durationSec: 'Длительность (сек):',
    doneBtn: 'Готово',
    snippetInfo: (start, end) => `Отрезок: ${start}с – ${end}с`,

    scheduleTitle: 'Расписание',
    shortenedTitle: 'Сокращённые уроки',
    shortenedMode: 'Режим сокращённого дня',
    shortenedDisabledMsg: 'Режим сокращённого расписания отключён',
    shortenedActiveWarning: 'Включён режим сокращённого расписания. Основное расписание сейчас выключено.',
    switchToRegularBtn: 'Включить обычное расписание',
    regularDisabledByShortened: 'Звонки подаются по сокращённому графику.',
    editRegularAnyway: 'Показать основное расписание для настройки',
    hideRegularSchedule: 'Скрыть основное расписание',
    noBellsForDay: 'Нет звонков на этот день',
    addBell: 'Добавить звонок',
    startLesson: 'Начало',
    endLesson: 'Конец',
    dragToReorder: 'Потяните, чтобы изменить порядок (клик — сменить тип)',
    copyToWeekdays: 'Скопировать на Пн–Пт',
    copySuccess: 'Расписание скопировано на будние дни (Пн–Пт)',

    newBellTitle: 'Новый звонок',
    editBellTitle: 'Редактировать звонок',
    bellNameLabel: 'Название',
    bellNamePlaceholder: 'Название звонка',
    bellTimeLabel: 'Время',
    bellTypeLabel: 'Тип',
    bellMelodyLabel: 'Мелодия',
    cancelBtn: 'Отмена',
    saveBtn: 'Сохранить',
    lessonDefaultName: (num) => `${num} урок`,

    settingsTitle: 'Настройки',
    saveSettings: 'Сохранить',
    savedNotification: 'Сохранено!',
    languageLabel: 'Язык интерфейса',
    languageDesc: 'Выберите язык приложения (Русский, English, Eesti)',
    darkModeLabel: 'Тёмная тема',
    darkModeDesc: 'Переключение между светлым и тёмным оформлением',
    autostartLabel: 'Автозапуск с Windows',
    autostartDesc: 'Запуск приложения при старте системы',
    systemVolumeLabel: 'Общая громкость',
    audioOutputDeviceLabel: 'Устройство вывода звука',
    audioOutputDeviceDesc: 'Выберите динамики или звуковую карту для воспроизведения звонков',
    defaultAudioDevice: 'По умолчанию (системное устройство)',
    testSoundBtn: 'Проверить звук',
    testingSound: 'Воспроизведение...',

    trimModalTitle: 'Выбор отрезка мелодии',
    trimTrackSubtitle: 'Укажите нужный момент и длительность звучания для звонка',
    trimWaveformLabel: 'Звуковая дорожка',
    trimStartTime: 'Начало отрезка',
    trimEndTime: 'Конец отрезка',
    trimDurationLabel: 'Длительность звучания',
    trimPlaySnippet: 'Слушать отрезок',
    trimStopSnippet: 'Остановить',
    trimPreset10s: '10 сек',
    trimPreset15s: '15 сек',
    trimPreset20s: '20 сек',
    trimPreset30s: '30 сек',
    trimPresetFull: 'Вся песня',
    trimSaveBtn: 'Сохранить и выбрать',
    noMelodiesMsg: 'Список мелодий пуст. Нажмите «Загрузить мелодию», чтобы добавить файл.',
    noMelodySelected: 'Мелодия не выбрана',
    noMusicToRing: 'Нельзя подать звонок: сначала загрузите мелодию',
    noMelodiesDashboard: 'Мелодии не загружены. Для подачи звонков добавьте аудиофайл в разделе «Звонки».',

    trackClassic: 'Школьный звонок (классический)',
    trackWestminster: 'Мелодия «Вестминстер»',
    trackGong: 'Мягкий школьный гонг',
    trackMarimba: 'Современная маримба',
  },

  en: {
    navDashboard: 'Dashboard',
    navBells: 'Bells',
    navSchedule: 'Schedule',
    navShortened: 'Shortened lessons',
    navSettings: 'Settings',

    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    today: 'Today',
    todayActive: 'Today · Active',
    weekend: 'Weekend',
    disabled: 'Disabled',

    ringNow: 'Ring bell now',
    stopRing: 'Stop bell',
    bellPlayingNow: 'Bell is playing now',
    systemRunning: 'System is active',
    todayIs: 'Today',
    bellsCount: 'bells',
    bellsDisabled: 'Bells are disabled',
    nextBell: 'Next bell',
    inMinutesSeconds: (m, s) => `in ${m}m ${String(s).padStart(2, '0')}s`,
    lessonsFinished: 'Lessons finished',
    mainMelody: 'Main ringtone',
    daysOfWeekTitle: 'Days of the week',
    shortenedBadge: 'Shortened',
    secondsSuffix: 'sec',

    bellsTitle: 'Bells',
    uploadSong: 'Upload audio file',
    bellDuration: 'Bell duration',
    volume: 'Volume',
    repeatMelody: 'Repeat melody',
    melodyLibrary: 'Ringtone library',
    snippetBtn: 'Trim',
    selectBtn: 'Select',
    selectedBtn: 'Selected',
    startSec: 'Start (sec):',
    durationSec: 'Duration (sec):',
    doneBtn: 'Done',
    snippetInfo: (start, end) => `Snippet: ${start}s – ${end}s`,

    scheduleTitle: 'Schedule',
    shortenedTitle: 'Shortened lessons',
    shortenedMode: 'Shortened schedule mode',
    shortenedDisabledMsg: 'Shortened schedule mode is disabled',
    shortenedActiveWarning: 'Shortened schedule mode is active. Main schedule is currently turned off.',
    switchToRegularBtn: 'Switch to regular schedule',
    regularDisabledByShortened: 'Bells are ringing according to the shortened schedule.',
    editRegularAnyway: 'Show main schedule to edit',
    hideRegularSchedule: 'Hide main schedule',
    noBellsForDay: 'No bells for this day',
    addBell: 'Add bell',
    startLesson: 'Start',
    endLesson: 'End',
    dragToReorder: 'Drag to change order (click to toggle type)',
    copyToWeekdays: 'Copy to Mon–Fri',
    copySuccess: 'Schedule copied to weekdays (Mon–Fri)',

    newBellTitle: 'New bell',
    editBellTitle: 'Edit bell',
    bellNameLabel: 'Label',
    bellNamePlaceholder: 'Bell name / lesson',
    bellTimeLabel: 'Time',
    bellTypeLabel: 'Type',
    bellMelodyLabel: 'Ringtone',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    lessonDefaultName: (num) => `Lesson ${num}`,

    settingsTitle: 'Settings',
    saveSettings: 'Save',
    savedNotification: 'Saved!',
    languageLabel: 'Interface language',
    languageDesc: 'Choose application language (Russian, English, Estonian)',
    darkModeLabel: 'Dark mode',
    darkModeDesc: 'Toggle between light and dark theme',
    autostartLabel: 'Launch on Windows startup',
    autostartDesc: 'Automatically start app when computer turns on',
    systemVolumeLabel: 'Master volume',
    audioOutputDeviceLabel: 'Audio Output Device',
    audioOutputDeviceDesc: 'Select speakers or audio output destination for school bells',
    defaultAudioDevice: 'Default (System output)',
    testSoundBtn: 'Test Sound',
    testingSound: 'Playing...',

    trimModalTitle: 'Select Audio Snippet',
    trimTrackSubtitle: 'Choose the start moment and duration for the bell ringtone',
    trimWaveformLabel: 'Audio Waveform',
    trimStartTime: 'Snippet Start',
    trimEndTime: 'Snippet End',
    trimDurationLabel: 'Playing Duration',
    trimPlaySnippet: 'Play Snippet',
    trimStopSnippet: 'Stop',
    trimPreset10s: '10s',
    trimPreset15s: '15s',
    trimPreset20s: '20s',
    trimPreset30s: '30s',
    trimPresetFull: 'Full Track',
    trimSaveBtn: 'Save and Select',
    noMelodiesMsg: 'Melody list is empty. Click "Upload song" to add a bell melody.',
    noMelodySelected: 'No melody selected',
    noMusicToRing: 'Cannot ring: please upload at least one melody',
    noMelodiesDashboard: 'No melodies uploaded. To ring bells, add an audio file in the "Bells" section.',

    trackClassic: 'Classic school bell',
    trackWestminster: 'Westminster chimes',
    trackGong: 'Gentle school gong',
    trackMarimba: 'Modern marimba',
  },

  et: {
    navDashboard: 'Avaleht',
    navBells: 'Helinad',
    navSchedule: 'Tunniplaan',
    navShortened: 'Lühendatud tunnid',
    navSettings: 'Seaded',

    days: ['Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev', 'Pühapäev'],
    daysShort: ['E', 'T', 'K', 'N', 'R', 'L', 'P'],
    today: 'Täna',
    todayActive: 'Täna · Aktiivne',
    weekend: 'Nädalavahetus',
    disabled: 'Väljas',

    ringNow: 'Helista kella',
    stopRing: 'Peata kell',
    bellPlayingNow: 'Kell heliseb',
    systemRunning: 'Süsteem töötab',
    todayIs: 'Täna',
    bellsCount: 'kella',
    bellsDisabled: 'Kellad on välja lülitatud',
    nextBell: 'Järgmine kell',
    inMinutesSeconds: (m, s) => `${m} min ${String(s).padStart(2, '0')} s pärast`,
    lessonsFinished: 'Tunnid on lõppenud',
    mainMelody: 'Põhihelin',
    daysOfWeekTitle: 'Nädalapäevad',
    shortenedBadge: 'Lühendatud',
    secondsSuffix: 'sek',

    bellsTitle: 'Helinad',
    uploadSong: 'Laadi laul üles',
    bellDuration: 'Kella kestus',
    volume: 'Helitugevus',
    repeatMelody: 'Korda helinat',
    melodyLibrary: 'Helinate kogu',
    snippetBtn: 'Lõik',
    selectBtn: 'Vali',
    selectedBtn: 'Valitud',
    startSec: 'Algus (sek):',
    durationSec: 'Kestus (sek):',
    doneBtn: 'Valmis',
    snippetInfo: (start, end) => `Lõik: ${start}s – ${end}s`,

    scheduleTitle: 'Tunniplaan',
    shortenedTitle: 'Lühendatud tunnid',
    shortenedMode: 'Lühendatud päeva režiim',
    shortenedDisabledMsg: 'Lühendatud tundide režiim on välja lülitatud',
    shortenedActiveWarning: 'Lühendatud tundide režiim on aktiivne. Tavaline tunniplaan on välja lülitatud.',
    switchToRegularBtn: 'Lülita tavalisele tunniplaanile',
    regularDisabledByShortened: 'Koolikellad helisevad lühendatud plaani järgi.',
    editRegularAnyway: 'Näita tavalist tunniplaani muutmiseks',
    hideRegularSchedule: 'Peida tavaline tunniplaan',
    noBellsForDay: 'Tänaseks kellasid pole',
    addBell: 'Lisa kell',
    startLesson: 'Algus',
    endLesson: 'Lõpp',
    dragToReorder: 'Lohistage järjekorra muutmiseks (klõpsake tüübi vahetamiseks)',
    copyToWeekdays: 'Kopeeri E–R',
    copySuccess: 'Tunniplaan kopeeritud tööpäevadele (E–R)',

    newBellTitle: 'Uus kell',
    editBellTitle: 'Muuda kella',
    bellNameLabel: 'Pealkiri',
    bellNamePlaceholder: 'Kella nimetus / tund',
    bellTimeLabel: 'Aeg',
    bellTypeLabel: 'Tüüp',
    bellMelodyLabel: 'Helin',
    cancelBtn: 'Tühista',
    saveBtn: 'Salvesta',
    lessonDefaultName: (num) => `${num}. tund`,

    settingsTitle: 'Seaded',
    saveSettings: 'Salvesta',
    savedNotification: 'Salvestatud!',
    languageLabel: 'Liidese keel',
    languageDesc: 'Vali rakenduse keel (Vene, Inglise, Eesti)',
    darkModeLabel: 'Tume teema',
    darkModeDesc: 'Lülita heleda ja tumeda režiimi vahel',
    autostartLabel: 'Käivita Windowsiga',
    autostartDesc: 'Käivita rakendus automaatselt arvuti sisselülitamisel',
    systemVolumeLabel: 'Üldine helitugevus',
    audioOutputDeviceLabel: 'Heliväljundseade',
    audioOutputDeviceDesc: 'Valige koolikellade esitamiseks kõlarid või heliväljund',
    defaultAudioDevice: 'Vaikimisi (süsteemi seade)',
    testSoundBtn: 'Testi heli',
    testingSound: 'Esitamine...',

    trimModalTitle: 'Helina lõigu valimine',
    trimTrackSubtitle: 'Määrake kellahelinaks soovitud hetk ja kestus',
    trimWaveformLabel: 'Helirada',
    trimStartTime: 'Lõigu algus',
    trimEndTime: 'Lõigu lõpp',
    trimDurationLabel: 'Kestus',
    trimPlaySnippet: 'Kuula lõiku',
    trimStopSnippet: 'Peata',
    trimPreset10s: '10 sek',
    trimPreset15s: '15 sek',
    trimPreset20s: '20 sek',
    trimPreset30s: '30 sek',
    trimPresetFull: 'Kogu lugu',
    trimSaveBtn: 'Salvesta ja vali',
    noMelodiesMsg: 'Helinate nimekiri on tühi. Klõpsake "Laadi laul üles", et lisada helin.',
    noMelodySelected: 'Helinat pole valitud',
    noMusicToRing: 'Ei saa helistada: laadige üles vähemalt üks meloodia',
    noMelodiesDashboard: 'Meloodiaid pole lisatud. Kellade helistamiseks lisage helifail jaotises "Helinad".',

    trackClassic: 'Koolikell (klassikaline)',
    trackWestminster: 'Westminsteri kellamäng',
    trackGong: 'Kooligong',
    trackMarimba: 'Kaasaegne marimba',
  },
};
