// src/stores/tracks.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase.js' // проверь путь

export const useTracksStore = defineStore('tracks', {
  state: () => ({
    tracks: [] // [{ id, title, isLikedByUser, likesCount, src, ... }]
  }),
  actions: {
    setTracks(arr) {
      this.tracks = arr || []
    },
    getTrackById(id) {
      return this.tracks.find(t => t?.id === id) || null
    },
    setTrackLikeLocal(trackId, isLiked, likesCount) {
      const t = this.getTrackById(trackId)
      if (t) {
        t.isLikedByUser = isLiked
        t.likesCount = likesCount
      }
    },

    // Основная логика лайка — меняет в БД и возвращает актуальное число лайков
    async toggleLike(trackId, userId) {
    if (!userId) throw new Error('User not provided');
    const track = this.getTrackById(trackId);
    if (!track) throw new Error('Трек не найден в tracksStore');

    const currentLiked = Boolean(track.isLikedByUser ?? track.liked);
    const isNowLiked = !currentLiked;

    try {
        if (isNowLiked) {
        const { error: insertErr } = await supabase
            .from('likes')
            .insert({ idTrack: trackId, authorId: userId });
        if (insertErr) {
            // допустим, duplicate — логируем, но не прерываем
            console.warn('Supabase insert like error:', insertErr);
        }
        } else {
        const { error: deleteErr } = await supabase
            .from('likes')
            .delete()
            .match({ idTrack: trackId, authorId: userId });
        if (deleteErr) {
            console.warn('Supabase delete like error:', deleteErr);
        }
        }

        // Получим актуальное число лайков с сервера
        const { data: likesData, error: likesErr } = await supabase
        .from('likes')
        .select('idTrack')
        .eq('idTrack', trackId);

        let likesCount = 0;
        if (!likesErr && Array.isArray(likesData)) likesCount = likesData.length;
        else {
        // fallback: корректируем локально
        likesCount = (track.likesCount ?? 0) + (isNowLiked ? 1 : -1);
        if (likesCount < 0) likesCount = 0;
        }

        // Мутируем существующий объект прямо — это гарантирует реактивность
        track.isLikedByUser = isNowLiked;
        track.liked = isNowLiked; // на всякий случай для совместимости
        track.likesCount = likesCount;

        return { trackId, isNowLiked, likesCount };
    } catch (e) {
        console.error('tracksStore.toggleLike error:', e);
        throw e;
    }
    }
  }
})
