const BlogPost = require('../models/blog-post');
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");
const status = 'success';

exports.getAllLinks = async (req, res) => {
  const data = await BlogPost.distinct('url', { isActive: true }).lean();
  res.json({ status, data });
};

exports.getPostByURL = async (req, res) => {
  const { category, post } = req.params;
  const url = `/blog/${category}/${post}`;
  const data = await BlogPost.findOne({ isActive: true, url }).lean();
  res.json({ status, data });
};

exports.getListAndCategories = async (req, res) => {
  const list = await BlogPost.find().lean();
  const categories = await BlogPost.distinct('category').lean();

  res.json({ status, data: { list, categories } });
};

exports.getActiveListAndCategories = async (req, res) => {
  BlogPost.SyncToAlgolia();
  const list = await BlogPost.find({ isActive: true }).lean();
  const categories = await BlogPost.distinct('category', { isActive: true }).lean();

  res.json({ status, data: { list, categories } });
};

exports.createPost = async (req, res, next) => {
  try {
    const { body } = req;
    const newPost = await new BlogPost(body).save();
    if (newPost) {
      res.json({ status });
    }
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    next(new NotAllowed(error.message || error));
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { body, params: { id } } = req;
    const updatedPost = await BlogPost.findByIdAndUpdate(id, body, { new: true });
    if (!updatedPost.isActive) {
      updatedPost.RemoveFromAlgolia();
    }
    if (updatedPost) {
      updatedPost.SyncToAlgolia();
      res.json({ status });
    }
  } catch (error) {
    next(new BadRequest(error.message || error));
  }
}

exports.deletePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    const removedPost  = await BlogPost.findByIdAndDelete(id);
    removedPost.RemoveFromAlgolia();
    if (removedPost) {
      res.json({ status });
    } else {
      return next(new NotFound("There is no blog post with such id"));
    }
  } catch (error) {
    return next(new NotAllowed(error.message || error));
  }
};