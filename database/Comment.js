const dbConnect = require('./dbconnect');

class Comment {
    constructor(CommentId, CommentOwnerId, CommentFoodId, CommentContent, CommentTime, isReply) {
        this.CommentId = CommentId;
        this.CommentOwnerId = CommentOwnerId;
        this.CommentFoodId = CommentFoodId;
        this.CommentContent = CommentContent;
        this.CommentTime = CommentTime;
        this.isReply = isReply;
    }
}
module.exports = Comment