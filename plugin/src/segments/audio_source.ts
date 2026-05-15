import type {
  IAudioSourceEndpoint,
  SpotubeAudioSourceContainerPreset,
  SpotubeAudioSourceMatchObject,
  SpotubeAudioSourceStreamObject,
  SpotubeTrackObject,
} from "@spotube-app/plugin";

export default class AudioSourceEndpoint implements IAudioSourceEndpoint {
  supportedPresets(): SpotubeAudioSourceContainerPreset[] {
    // Return typical standard formats or type casting as string
    return ["flac", "mp3", "m4a", "webm", "ogg"] as unknown as SpotubeAudioSourceContainerPreset[];
  }
  async matches(track: SpotubeTrackObject): Promise<SpotubeAudioSourceMatchObject[]> {
    if (!track.isrc) {
        return [];
    }

    try {
        const response = await fetch(`https://qdl-api.monochrome.tf/api/get-music?q=${track.isrc}&offset=0`);
        if (!response.ok) return [];

        const res = await response.json();
        if (res.success && res.data?.tracks?.items?.length > 0) {
           const match = res.data.tracks.items[0];
           return [{
               id: match.id.toString(),
               title: match.title,
               author: match.performer?.name || "",
               duration: match.duration,
               source: "monochrome",
               viewUrl: "",
               thumbnailUrl: match.album?.image?.thumbnail || ""
           }];
        }
    } catch(e) {
        // fail gracefully
    }
    return [];
  }
  async streams(
    matched: SpotubeAudioSourceMatchObject
  ): Promise<SpotubeAudioSourceStreamObject[]> {
    return [{
       format: "flac",
       quality: "high",
       container: "flac" as any,
       streamUrl: `https://qdl-api.monochrome.tf/track/?id=${matched.id}&quality=LOSSLESS`
    }];
  }
}

