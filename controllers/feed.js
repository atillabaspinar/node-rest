const fs = require('fs');
const path = require('path');

const {
    validationResult
} = require('express-validator/check');

const mongoose = require('mongoose');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    const posts = Post.find().then(result => {
        res.status(200).json({
            posts: result
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        err.message = "db error";
        console.log(err);
        next();
    });
};

exports.createPost = (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validation failed' + errors.array());
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    if (!req.file) {
        const err = new Error('no image provided');
        err.statusCode = 422;
        throw err;
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'atilla'
        }
    });
    post.save().then(result => {
        res.status(201).json({
            message: 'created',
            post: result
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        err.message = "db error";
        console.log(err);
        next();
    });
};

exports.getPost = (req, res, next) => {
    console.log('getPOst');
    const id = req.params.postId;
    Post.findById(id).then(post => {
        if (!post) {
            const err = new Error('could not found post')
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            message: 'post found',
            post: post
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
            next();
        }
    });
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validation failed' + errors.array());
        error.statusCode = 422;
        throw error;
    }    
    const id = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\" ,"/");
    }
    if (!imageUrl) {
        const err = new Error('no image provided');
        err.statusCode = 422;
        throw err;
    }
    Post.findById(id).then(post => {
        if (!post) {
            const err = new Error('could not found post')
            err.statusCode = 404;
            throw err;
        }
        post.title = title;
        post.content = content;
        if (post.imageUrl !== imageUrl) {
            clearImage(post.imageUrl);
        }
        post.imageUrl = imageUrl;
        
        return post.save();        
    }).then(result =>
        res.status(200).json({message: 'post updated', post: result})
    ).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
            next();
        }
    });
};

clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err=> console.log(err));
};