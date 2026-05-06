import mongoose from "mongoose";
import 'dotenv/config';

mongoose.connect(process.env.MONGO_URI);

const VideoSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    raw: {
      video_id: String,
      language: String,
      transcript: [
        {
          text: String,
          start: Number,
          duration: Number,
        },
      ],
      metadata: {
        title: String,
      },
    },

    processed: {
      formatted: String,
      wordCount: Number,
      duration: Number,
      clips: Array,
      blogSummary: String,
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", VideoSchema);