const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const { Schema } = mongoose;

const BlogPostSchema = new Schema(
  {
    title: String,
    url: String,
    category: String,
    content: Object,
    html: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    seoTags: Object,
    metaCanonical: String,
    callToActionLink: String,
    callToActionText: String,
    previewDescription: String,
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

BlogPostSchema.plugin(mongooseAlgolia, {
  appId: process.env.ALGOLIA_APP_ID,
  apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
  indexName: 'blog_posts',
  selector: '-_id',
  filter: function (doc) {
    return doc.isActive;
  },
});

const BlogPost = mongoose.model('blog-post', BlogPostSchema);

BlogPost.SetAlgoliaSettings({
  searchableAttributes: ['title', 'category', 'html'], //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
});
BlogPost.SyncToAlgolia();

module.exports = BlogPost;
