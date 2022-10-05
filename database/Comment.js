const dbConnect = require('./dbconnect');

class Comment {
    constructor(CommentId, CommentOwnerId, CommentOwnerName, CommentFoodId, CommentContent, CommentTime, isReply) {
        this.CommentId = CommentId;
        this.CommentOwnerId = CommentOwnerId;
        this.CommentOwnerName = CommentOwnerName;
        this.CommentFoodId = CommentFoodId;
        this.CommentContent = CommentContent;
        this.CommentTime = CommentTime;
    }
    async getCommentByFoodId(FoodId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                let sql = `
                SELECT 
                bl.BL_MABL, bl.MA_MAMON, bl.KH_MAKH, kh.KH_TENKH, bl.BL_NOIDUNG, bl.BL_THOIGIANBL,
                tlbl.TLBL_MATLBL, tlbl.NVPT_MANV, nvpt.NVPT_TENNV, tlbl.TLBL_NOIDUNG, tlbl.TLBL_THOIGIAN
                FROM binh_luan bl 
                JOIN khach_hang kh ON kh.KH_MAKH = bl.KH_MAKH 
                LEFT OUTER JOIN tra_loi_bl tlbl ON bl.BL_MABL = tlbl.BL_MABL 
                LEFT OUTER JOIN nhan_vien_phu_trach nvpt on tlbl.NVPT_MANV = nvpt.NVPT_MANV
                WHERE MA_MAMON = ?`;
                dbConnect.query(sql, [FoodId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let comments = [];
                            let checked = 0;
                            for (let i = 0; i < result.length; i = checked + 1) {
                                checked = i;
                                let CommentReplies = []
                                if (result[i].TLBL_MATLBL != null)
                                    CommentReplies = [{
                                        CommentReplyID: result[i].TLBL_MATLBL,
                                        CommentReplyFor: result[i].BL_MABL,
                                        CommentReplierID: result[i].NVPT_MANV,
                                        CommentReplierName: result[i].NVPT_TENNV,
                                        CommentReplyContent: result[i].TLBL_NOIDUNG,
                                        CommentReplyTime: result[i].TLBL_THOIGIAN,
                                    }];
                                for (let j = i + 1; j < result.length; j++) {
                                    if (result[i].BL_MABL === result[j].BL_MABL) {
                                        if (CommentReplies.find((reply => { return reply.CommentReplyFor === result[j].CommentReplyFor })) == undefined)
                                            CommentReplies.push({
                                                CommentReplyID: result[j].TLBL_MATLBL,
                                                CommentReplyFor: result[j].BL_MABL,
                                                CommentReplierID: result[j].NVPT_MANV,
                                                CommentReplierName: result[j].NVPT_TENNV,
                                                CommentReplyContent: result[j].TLBL_NOIDUNG,
                                                CommentReplyTime: result[j].TLBL_THOIGIAN,
                                            })
                                        checked = j;
                                    } else
                                        break
                                }
                                comments.push({
                                    CommentId: result[i].BL_MABL,
                                    CommentOwnerId: result[i].KH_MAKH,
                                    CommentOwnerName: result[i].KH_TENKH,
                                    CommentFoodId: result[i].MA_MAMON,
                                    CommentContent: result[i].BL_NOIDUNG,
                                    CommentTime: result[i].BL_THOIGIANBL,
                                    CommentReplies
                                })
                            }
                            resolve(comments);
                        }
                        else
                            resolve(new Comment())
                    }

                })
            })
        });
    }

    async addComment(FoodId, CustomerId, Content) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = "call THEM_BINH_LUAN(?,?,?)";
                dbConnect.query(sql, [FoodId, CustomerId, Content], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(result.affectedRows)
                    }

                })
            })
        });
    }

    async editComment(CommentId, FoodId, CustomerId, Content) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `
                        UPDATE binh_luan 
                        SET BL_NOIDUNG = ?
                        WHERE BL_MABL = ? AND MA_MAMON = ? AND KH_MAKH = ?`;
                dbConnect.query(sql, [Content, CommentId, FoodId, CustomerId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(result.affectedRows)
                    }

                })
            })
        });
    }

    async deleteComment(CommentId, FoodId, CustomerId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `
                        DELETE FROM binh_luan
                        WHERE BL_MABL = ? AND MA_MAMON = ? AND KH_MAKH = ?`;
                dbConnect.query(sql, [CommentId, FoodId, CustomerId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(result.affectedRows)
                    }

                })
            })
        });
    }
}
module.exports = Comment