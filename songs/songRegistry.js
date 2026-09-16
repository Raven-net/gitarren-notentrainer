/**
 * Song-Katalog mit allen vorinstallierten Liedern.
 * Dient sowohl als statische Absicherung (z. B. bei Öffnen über file:// ohne Server)
 * als auch als Verzeichnis für dynamisches Nachladen.
 */

export const BUILTIN_SONGS = [
  {
      "id": "guitar_in_action",
      "title": "Guitar in Action",
      "artist": "Hochweber",
      "bpm": 120,
      "timeSignature": [
          4,
          4
      ],
      "description": "Blues- und Rock-Gitarrenstück mit Wechselbass und Melodie",
      "notes": [
          {
              "midi": 69,
              "beat": 0,
              "duration": 0.5
          },
          {
              "midi": 69,
              "beat": 1,
              "duration": 0.5
          },
          {
              "midi": 69,
              "beat": 2,
              "duration": 0.5
          },
          {
              "midi": 69,
              "beat": 3,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 4,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 4.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 5,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 5.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 6,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 6.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 7,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 7.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 8,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 8.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 9,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 9.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 10,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 10.625,
              "duration": 1
          },
          {
              "midi": 43,
              "beat": 11.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 12,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 12.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 13,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 13.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 14,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 14.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 15,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 15.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 16,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 16.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 17,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 17.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 18,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 18.625,
              "duration": 1
          },
          {
              "midi": 48,
              "beat": 19.625,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 20,
              "duration": 4
          },
          {
              "midi": 62,
              "beat": 20.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 21,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 21.625,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 22,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 22.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 23,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 23.625,
              "duration": 4
          },
          {
              "midi": 50,
              "beat": 24,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 24.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 25,
              "duration": 0.5
          },
          {
              "midi": 48,
              "beat": 25.625,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 26,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 26.625,
              "duration": 1
          },
          {
              "midi": 48,
              "beat": 27.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 28,
              "duration": 4
          },
          {
              "midi": 57,
              "beat": 28.625,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 29,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 29.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 30,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 30.625,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 31,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 31.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 32,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 32.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 33,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 33.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 34,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 34.625,
              "duration": 1
          },
          {
              "midi": 43,
              "beat": 35.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 36,
              "duration": 4
          },
          {
              "midi": 64,
              "beat": 36.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 37,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 37.625,
              "duration": 0.5
          },
          {
              "midi": 67,
              "beat": 38,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 38.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 39,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 39.625,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 40,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 40.625,
              "duration": 0.5
          },
          {
              "midi": 52,
              "beat": 41,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 41.625,
              "duration": 0.5
          },
          {
              "midi": 52,
              "beat": 42,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 42.625,
              "duration": 0.5
          },
          {
              "midi": 48,
              "beat": 43,
              "duration": 0.5
          },
          {
              "midi": 47,
              "beat": 43.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 44,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 44.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 45,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 45.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 46,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 46.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 47,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 47.625,
              "duration": 4
          },
          {
              "midi": 40,
              "beat": 48,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 48.625,
              "duration": 1
          },
          {
              "midi": 43,
              "beat": 50,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 50.625,
              "duration": 1
          },
          {
              "midi": 45,
              "beat": 52,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 52.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 53,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 53.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 54,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 54.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 55,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 55.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 56,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 56.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 57,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 57.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 58,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 58.625,
              "duration": 1
          },
          {
              "midi": 43,
              "beat": 59.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 60,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 60.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 61,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 61.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 62,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 62.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 63,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 63.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 64,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 64.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 65,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 65.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 66,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 66.625,
              "duration": 1
          },
          {
              "midi": 48,
              "beat": 67.625,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 68,
              "duration": 4
          },
          {
              "midi": 62,
              "beat": 68.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 69,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 69.625,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 70,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 70.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 71,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 71.625,
              "duration": 4
          },
          {
              "midi": 50,
              "beat": 72,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 72.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 73,
              "duration": 0.5
          },
          {
              "midi": 48,
              "beat": 73.625,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 74,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 74.625,
              "duration": 1
          },
          {
              "midi": 48,
              "beat": 75.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 76,
              "duration": 4
          },
          {
              "midi": 57,
              "beat": 76.625,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 77,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 77.625,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 78,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 78.625,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 79,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 79.625,
              "duration": 4
          },
          {
              "midi": 45,
              "beat": 80,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 80.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 81,
              "duration": 0.5
          },
          {
              "midi": 43,
              "beat": 81.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 82,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 82.625,
              "duration": 1
          },
          {
              "midi": 43,
              "beat": 83.625,
              "duration": 0.5
          },
          {
              "midi": 40,
              "beat": 84,
              "duration": 4
          },
          {
              "midi": 64,
              "beat": 84.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 85,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 85.625,
              "duration": 0.5
          },
          {
              "midi": 67,
              "beat": 86,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 86.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 87,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 87.625,
              "duration": 0.5
          },
          {
              "midi": 57,
              "beat": 88,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 88.625,
              "duration": 0.5
          },
          {
              "midi": 52,
              "beat": 89,
              "duration": 0.5
          },
          {
              "midi": 55,
              "beat": 89.625,
              "duration": 0.5
          },
          {
              "midi": 52,
              "beat": 90,
              "duration": 0.5
          },
          {
              "midi": 50,
              "beat": 90.625,
              "duration": 0.5
          },
          {
              "midi": 48,
              "beat": 91,
              "duration": 0.5
          },
          {
              "midi": 47,
              "beat": 91.625,
              "duration": 0.5
          },
          {
              "midi": 45,
              "beat": 92,
              "duration": 4
          },
          {
              "midi": 60,
              "beat": 92.625,
              "duration": 0.5
          },
          {
              "midi": 59,
              "beat": 93,
              "duration": 0.5
          },
          {
              "midi": 60,
              "beat": 93.625,
              "duration": 0.5
          },
          {
              "midi": 62,
              "beat": 94,
              "duration": 0.5
          },
          {
              "midi": 64,
              "beat": 94.625,
              "duration": 0.5
          },
          {
              "midi": 67,
              "beat": 95,
              "duration": 0.5
          },
          {
              "midi": 69,
              "beat": 95.625,
              "duration": 4
          }
      ],
      "category": "Hochweber"
  },
  {
  "id": "intro",
  "title": "Intro",
  "artist": "Hochweber",
  "category": "Hochweber",
  "bpm": 115,
  "timeSignature": [
    4,
    4
  ],
  "description": "Klassisches Gitarrenstück / Intro von Jürg Hochweber",
  "notes": [
    {
      "midi": 60,
      "beat": 0,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 1,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 2,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 3,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 4,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 7,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 7.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 8,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 8.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 9,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 9.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 10,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 10.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 11,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 11.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 12,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 12.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 13,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 13.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 14,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 14.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 15,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 15.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 16,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 16.5,
      "duration": 1
    },
    {
      "midi": 50,
      "beat": 17,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 17.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 18,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 18.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 19,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 19.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 20,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 20.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 21,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 21.5,
      "duration": 1
    },
    {
      "midi": 48,
      "beat": 22,
      "duration": 0.5
    },
    {
      "midi": 48,
      "beat": 22.5,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 23,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 23.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 24,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 24.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 25,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 25.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 26,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 26.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 27,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 27.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 28,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 28.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 29,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 29.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 30,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 30.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 31,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 31.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 32,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 32.5,
      "duration": 1
    },
    {
      "midi": 50,
      "beat": 33,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 33.5,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 34,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 34.75,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 35,
      "duration": 0.5
    },
    {
      "midi": 50,
      "beat": 35.5,
      "duration": 0.5
    },
    {
      "midi": 48,
      "beat": 36,
      "duration": 2
    },
    {
      "midi": 64,
      "beat": 36.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 37,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 37.5,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 38,
      "duration": 2
    },
    {
      "midi": 57,
      "beat": 40,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 40.5,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 41,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 41.5,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 42,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 42.5,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 43,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 43.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 44,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 44.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 45,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 45.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 46,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 46.5,
      "duration": 0.5
    },
    {
      "midi": 59,
      "beat": 47,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 47.5,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 48,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 48.5,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 49,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 49.5,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 50,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 50.5,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 51,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 51.5,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 52,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 52.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 53,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 53.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 54,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 54.5,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 55,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 55.5,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 56,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 56.5,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 57,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 57.5,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 58,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 58.5,
      "duration": 0.5
    },
    {
      "midi": 60,
      "beat": 59,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 59.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 60,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 60.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 61,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 61.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 62,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 62.5,
      "duration": 0.5
    },
    {
      "midi": 59,
      "beat": 63,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 63.5,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 64,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 64.5,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 65,
      "duration": 1
    },
    {
      "midi": 57,
      "beat": 65.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 66,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 66.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 67,
      "duration": 1
    },
    {
      "midi": 59,
      "beat": 67.5,
      "duration": 0.5
    },
    {
      "midi": 48,
      "beat": 68,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 69,
      "duration": 1
    },
    {
      "midi": 48,
      "beat": 69.5,
      "duration": 1
    },
    {
      "midi": 60,
      "beat": 70,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 71,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 71.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 72,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 72.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 73,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 73.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 74,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 74.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 75,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 75.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 76,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 76.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 77,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 77.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 78,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 78.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 79,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 79.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 80,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 80.5,
      "duration": 1
    },
    {
      "midi": 50,
      "beat": 81,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 81.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 82,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 82.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 83,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 83.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 84,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 84.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 85,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 85.5,
      "duration": 2
    },
    {
      "midi": 48,
      "beat": 86,
      "duration": 0.5
    },
    {
      "midi": 48,
      "beat": 86.5,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 87,
      "duration": 0.5
    },
    {
      "midi": 53,
      "beat": 87.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 88,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 88.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 89,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 89.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 90,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 90.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 91,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 91.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 92,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 92.5,
      "duration": 1
    },
    {
      "midi": 52,
      "beat": 93,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 93.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 94,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 94.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 95,
      "duration": 0.5
    },
    {
      "midi": 57,
      "beat": 95.5,
      "duration": 0.5
    },
    {
      "midi": 55,
      "beat": 96,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 96.5,
      "duration": 1
    },
    {
      "midi": 50,
      "beat": 97,
      "duration": 1
    },
    {
      "midi": 65,
      "beat": 97.5,
      "duration": 2
    },
    {
      "midi": 53,
      "beat": 98,
      "duration": 1
    },
    {
      "midi": 53,
      "beat": 98.75,
      "duration": 0.5
    },
    {
      "midi": 52,
      "beat": 99,
      "duration": 0.5
    },
    {
      "midi": 50,
      "beat": 99.5,
      "duration": 0.5
    },
    {
      "midi": 48,
      "beat": 100,
      "duration": 2
    },
    {
      "midi": 64,
      "beat": 100.5,
      "duration": 1
    },
    {
      "midi": 55,
      "beat": 101,
      "duration": 1
    },
    {
      "midi": 64,
      "beat": 101.5,
      "duration": 2
    },
    {
      "midi": 60,
      "beat": 102,
      "duration": 2
    }
  ]
},
  {
    id: "smoke",
    title: "Smoke on the Water",
    artist: "Deep Purple",
    category: "Rock",
    bpm: 112,
    timeSignature: [4, 4],
    description: "Riff auf D- und G-Saite (Bund 0-3)",
    notes: [
      { midi: 50, duration: 1 },
      { midi: 53, duration: 1 },
      { midi: 55, duration: 2 },
      { midi: 50, duration: 1 },
      { midi: 53, duration: 1 },
      { midi: 56, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 50, duration: 1 },
      { midi: 53, duration: 1 },
      { midi: 55, duration: 2 },
      { midi: 53, duration: 1 },
      { midi: 50, duration: 1 },
      { midi: 50, duration: 2 }
    ]
  },
  {
    id: "seven_nation",
    title: "Seven Nation Army",
    artist: "The White Stripes",
    category: "Rock",
    bpm: 120,
    timeSignature: [4, 4],
    description: "Kult-Basslinie auf der Gitarre (E- und A-Saite)",
    notes: [
      { midi: 40, duration: 2 },
      { midi: 40, duration: 1 },
      { midi: 43, duration: 1 },
      { midi: 40, duration: 1 },
      { midi: 38, duration: 1 },
      { midi: 36, duration: 2 },
      { midi: 47, duration: 4 },
      { midi: 40, duration: 2 },
      { midi: 40, duration: 1 },
      { midi: 43, duration: 1 },
      { midi: 40, duration: 1 },
      { midi: 38, duration: 1 },
      { midi: 36, duration: 1 },
      { midi: 38, duration: 1 },
      { midi: 36, duration: 2 },
      { midi: 47, duration: 2 }
    ]
  },
  {
    id: "nem_intro",
    title: "Nothing Else Matters (Intro)",
    artist: "Metallica",
    category: "Rock",
    bpm: 92,
    timeSignature: [4, 4],
    description: "Berühmtes Fingerpicking-Intro auf leeren Saiten",
    notes: [
      { midi: 40, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 59, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 59, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 40, duration: 2 },
      { midi: 40, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 59, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 59, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 40, duration: 1 }
    ]
  },
  {
    id: "ode",
    title: "Ode an die Freude",
    artist: "Ludwig van Beethoven",
    category: "Klassik",
    bpm: 108,
    timeSignature: [4, 4],
    description: "Europahymne in C-Dur auf den hohen Saiten",
    notes: [
      { midi: 64, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 64, duration: 2 },
      { midi: 62, duration: 2 },
      { midi: 64, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 62, duration: 2 },
      { midi: 60, duration: 2 }
    ]
  },
  {
    id: "frere",
    title: "Frère Jacques",
    artist: "Traditional",
    category: "Traditionals",
    bpm: 100,
    timeSignature: [4, 4],
    description: "Klassischer Kanon (C-Dur)",
    notes: [
      { midi: 60, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 67, duration: 2 },
      { midi: 64, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 67, duration: 2 },
      { midi: 67, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 60, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 60, duration: 2 },
      { midi: 60, duration: 1 },
      { midi: 55, duration: 1 },
      { midi: 60, duration: 2 }
    ]
  },
  {
    id: "haenschen",
    title: "Hänschen klein",
    artist: "Traditional",
    category: "Traditionals",
    bpm: 104,
    timeSignature: [4, 4],
    description: "Traditionelles Volkslied (C-Dur)",
    notes: [
      { midi: 67, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 64, duration: 2 },
      { midi: 65, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 62, duration: 2 },
      { midi: 60, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 65, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 67, duration: 2 },
      { midi: 67, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 64, duration: 2 },
      { midi: 65, duration: 1 },
      { midi: 62, duration: 1 },
      { midi: 62, duration: 2 },
      { midi: 60, duration: 1 },
      { midi: 64, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 67, duration: 1 },
      { midi: 60, duration: 4 }
    ]
  },
  {
    id: "old_mcdonald",
    title: "Old McDonald",
    artist: "Traditionell",
    category: "Traditionals",
    bpm: 100,
    timeSignature: [4, 4],
    description: "Klassisches Kinder- und Volkslied",
    notes: [
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 59, duration: 1, string: 1, fret: 0 },
      { midi: 59, duration: 1, string: 1, fret: 0 },
      { midi: 57, duration: 2, string: 2, fret: 2 },
      { midi: 66, duration: 1, string: 0, fret: 2 },
      { midi: 66, duration: 1, string: 0, fret: 2 },
      { midi: 64, duration: 1, string: 0, fret: 0 },
      { midi: 64, duration: 1, string: 0, fret: 0 },
      { midi: 62, duration: 4, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 59, duration: 1, string: 1, fret: 0 },
      { midi: 59, duration: 1, string: 1, fret: 0 },
      { midi: 57, duration: 2, string: 2, fret: 2 },
      { midi: 66, duration: 1, string: 0, fret: 2 },
      { midi: 66, duration: 1, string: 0, fret: 2 },
      { midi: 64, duration: 1, string: 0, fret: 0 },
      { midi: 64, duration: 1, string: 0, fret: 0 },
      { midi: 62, duration: 4, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 57, duration: 1, string: 2, fret: 2 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 62, duration: 1, string: 1, fret: 3 },
      { midi: 59, duration: 1, string: 1, fret: 0 },
      { midi: 57, duration: 1, string: 2, fret: 2 }
    ]
  },
  {
    id: "sweet_child",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    category: "Rock",
    bpm: 125,
    timeSignature: [4, 4],
    description: "Das legendäre Intro-Lick von Slash (Bund 12 bis 15)",
    notes: [
      { midi: 62, duration: 0.5, string: 3, fret: 12 },
      { midi: 74, duration: 0.5, string: 1, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 67, duration: 0.5, string: 2, fret: 12 },
      { midi: 79, duration: 0.5, string: 0, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 78, duration: 0.5, string: 0, fret: 14 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },

      { midi: 62, duration: 0.5, string: 3, fret: 12 },
      { midi: 74, duration: 0.5, string: 1, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 67, duration: 0.5, string: 2, fret: 12 },
      { midi: 79, duration: 0.5, string: 0, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 78, duration: 0.5, string: 0, fret: 14 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },

      { midi: 64, duration: 0.5, string: 3, fret: 14 },
      { midi: 74, duration: 0.5, string: 1, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 67, duration: 0.5, string: 2, fret: 12 },
      { midi: 79, duration: 0.5, string: 0, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 78, duration: 0.5, string: 0, fret: 14 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },

      { midi: 64, duration: 0.5, string: 3, fret: 14 },
      { midi: 74, duration: 0.5, string: 1, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 67, duration: 0.5, string: 2, fret: 12 },
      { midi: 79, duration: 0.5, string: 0, fret: 15 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 },
      { midi: 78, duration: 0.5, string: 0, fret: 14 },
      { midi: 69, duration: 0.5, string: 2, fret: 14 }
    ]
  },
  {
    id: "enter_sandman",
    title: "Enter Sandman",
    artist: "Metallica",
    category: "Rock",
    bpm: 120,
    timeSignature: [4, 4],
    description: "Kult-Metal-Riff mit weiten Griffen (Bund 0 bis 7)",
    notes: [
      { midi: 40, duration: 1, string: 5, fret: 0 },
      { midi: 52, duration: 1, string: 4, fret: 7 },
      { midi: 55, duration: 1, string: 3, fret: 5 },
      { midi: 46, duration: 0.5, string: 5, fret: 6 },
      { midi: 45, duration: 0.5, string: 5, fret: 5 },
      { midi: 43, duration: 1, string: 5, fret: 3 },
      { midi: 40, duration: 3, string: 5, fret: 0 },

      { midi: 40, duration: 1, string: 5, fret: 0 },
      { midi: 52, duration: 1, string: 4, fret: 7 },
      { midi: 55, duration: 1, string: 3, fret: 5 },
      { midi: 46, duration: 0.5, string: 5, fret: 6 },
      { midi: 45, duration: 0.5, string: 5, fret: 5 },
      { midi: 43, duration: 1, string: 5, fret: 3 },
      { midi: 40, duration: 3, string: 5, fret: 0 },

      { midi: 40, duration: 1, string: 5, fret: 0 },
      { midi: 52, duration: 1, string: 4, fret: 7 },
      { midi: 55, duration: 1, string: 3, fret: 5 },
      { midi: 46, duration: 0.5, string: 5, fret: 6 },
      { midi: 45, duration: 0.5, string: 5, fret: 5 },
      { midi: 43, duration: 1, string: 5, fret: 3 },
      { midi: 40, duration: 3, string: 5, fret: 0 }
    ]
  },
  {
    id: "iron_man",
    title: "Iron Man",
    artist: "Black Sabbath",
    category: "Rock",
    bpm: 74,
    timeSignature: [4, 4],
    description: "Tony Iommis Heavy-Metal-Meilenstein entlang der A-Saite (Bund 2 bis 10)",
    notes: [
      { midi: 47, duration: 2, string: 4, fret: 2 },
      { midi: 50, duration: 1.5, string: 4, fret: 5 },
      { midi: 50, duration: 0.5, string: 4, fret: 5 },
      { midi: 52, duration: 2, string: 4, fret: 7 },
      { midi: 52, duration: 2, string: 4, fret: 7 },

      { midi: 55, duration: 0.5, string: 4, fret: 10 },
      { midi: 54, duration: 0.5, string: 4, fret: 9 },
      { midi: 55, duration: 0.5, string: 4, fret: 10 },
      { midi: 54, duration: 0.5, string: 4, fret: 9 },
      { midi: 55, duration: 1, string: 4, fret: 10 },
      { midi: 50, duration: 1, string: 4, fret: 5 },

      { midi: 50, duration: 1, string: 4, fret: 5 },
      { midi: 52, duration: 1.5, string: 4, fret: 7 },
      { midi: 52, duration: 1.5, string: 4, fret: 7 },

      { midi: 47, duration: 2, string: 4, fret: 2 },
      { midi: 50, duration: 1.5, string: 4, fret: 5 },
      { midi: 50, duration: 0.5, string: 4, fret: 5 },
      { midi: 52, duration: 2, string: 4, fret: 7 },
      { midi: 52, duration: 2, string: 4, fret: 7 }
    ]
  },
  {
    id: "sunshine",
    title: "Sunshine of Your Love",
    artist: "Cream (Eric Clapton)",
    category: "Rock",
    bpm: 115,
    timeSignature: [4, 4],
    description: "Eric Claptons berühmtes D-Blues-Riff (Bund 5 bis 12)",
    notes: [
      { midi: 62, duration: 1, string: 3, fret: 12 },
      { midi: 62, duration: 1, string: 3, fret: 12 },
      { midi: 60, duration: 1, string: 3, fret: 10 },
      { midi: 62, duration: 1, string: 3, fret: 12 },

      { midi: 56, duration: 1, string: 4, fret: 11 },
      { midi: 55, duration: 1, string: 4, fret: 10 },
      { midi: 53, duration: 1, string: 4, fret: 8 },
      { midi: 50, duration: 1, string: 4, fret: 5 },

      { midi: 62, duration: 1, string: 3, fret: 12 },
      { midi: 62, duration: 1, string: 3, fret: 12 },
      { midi: 60, duration: 1, string: 3, fret: 10 },
      { midi: 62, duration: 1, string: 3, fret: 12 },

      { midi: 56, duration: 1, string: 4, fret: 11 },
      { midi: 55, duration: 1, string: 4, fret: 10 },
      { midi: 53, duration: 1, string: 4, fret: 8 },
      { midi: 50, duration: 1, string: 4, fret: 5 }
    ]
  },
  {
    id: "back_in_black",
    title: "Back in Black",
    artist: "AC/DC (Angus Young)",
    category: "Rock",
    bpm: 92,
    timeSignature: [4, 4],
    description: "Kult-Akkorde, High-Lead-Lick (Bund 12-15) & chromatischer Turnaround",
    notes: [
      { midi: 40, duration: 1, string: 5, fret: 0 },
      { midi: 50, duration: 1, string: 3, fret: 0 },
      { midi: 45, duration: 2, string: 4, fret: 0 },

      { midi: 79, duration: 0.5, string: 0, fret: 15 },
      { midi: 76, duration: 0.5, string: 0, fret: 12 },
      { midi: 74, duration: 0.5, string: 1, fret: 15 },
      { midi: 71, duration: 0.5, string: 1, fret: 12 },
      { midi: 69, duration: 1, string: 2, fret: 14 },
      { midi: 40, duration: 1, string: 5, fret: 0 },

      { midi: 40, duration: 1, string: 5, fret: 0 },
      { midi: 50, duration: 1, string: 3, fret: 0 },
      { midi: 45, duration: 2, string: 4, fret: 0 },

      { midi: 47, duration: 0.5, string: 4, fret: 2 },
      { midi: 49, duration: 0.5, string: 4, fret: 4 },
      { midi: 47, duration: 0.5, string: 4, fret: 2 },
      { midi: 50, duration: 0.5, string: 4, fret: 5 },
      { midi: 47, duration: 0.5, string: 4, fret: 2 },
      { midi: 51, duration: 0.5, string: 4, fret: 6 },
      { midi: 47, duration: 0.5, string: 4, fret: 2 },
      { midi: 52, duration: 0.5, string: 4, fret: 7 }
    ]
  }
];

export function getBuiltinSong(id) {
  return BUILTIN_SONGS.find(s => s.id === id) || BUILTIN_SONGS[0];
}
