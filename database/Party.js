const dbConnect = require('./dbconnect')
const { orderStatus } = require('../function/orderStatus')
class Party {
    constructor(PartyID, PartyCustomer, PartyType, PartyTimeStart, PartyPlace, PartyNote, PartyAdmin, PartyDate, PartyDetails, PartyNumOfTable, PartySubTotal, PartyState) {
        this.PartyID = PartyID
        this.PartyCustomer = PartyCustomer
        this.PartyPlace = PartyPlace
        this.PartyTimeStart = PartyTimeStart
        this.PartyAdmin = PartyAdmin
        this.PartyDate = PartyDate
        this.PartyType = PartyType
        this.PartyNote = PartyNote
        this.PartyNumOfTable = PartyNumOfTable
        this.PartySubTotal = PartySubTotal
        this.PartyState = PartyState
        this.PartyDetails = PartyDetails
    }
    async create(PartyCustomer, PartyPlace, PartyType, PartyTimeStart, PartyNote, PartyNumOfTable, PartySubTotal) {
        return new Promise((resolve, reject) => {
            const sql = `call THEM_DON_DAT_TIEC(?,?,?,?,?,?,?, @MADON)`;
            dbConnect.query(sql, [PartyCustomer, PartyPlace, PartyType, PartyTimeStart, PartyNumOfTable, PartySubTotal, PartyNote], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(
                    new Party(
                        result[0][0]['@MADON'],
                        PartyCustomer,
                        PartyType,
                        PartyTimeStart,
                        PartyPlace,
                        PartyNote,
                        'NV0',
                        new Date(),
                        'Show in order detail page',
                        PartyNumOfTable,
                        PartySubTotal,
                        'Chờ xác nhận'
                    )
                )
            })
        });
    }

    async getAll(PartyCustomer) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM don_dat_tiec WHERE KH_MAKH = ?
                        ORDER BY DDT_NGAYGIO DESC`
            dbConnect.query(sql, [PartyCustomer], (err, result) => {
                if (err)
                    return reject(err)
                let parties = []
                result.forEach(e => {
                    parties.push({
                        PartyID: e.DDT_MADON,
                        PartyPlace: e.DDT_DIADIEM,
                        PartyTimeStart: e.DDT_NGAYGIODAI,
                        PartyDate: e.DDT_NGAYGIO,
                        PartyType: e.DDT_LOAITIEC,
                        PartyNote: e.DDT_NOTE,
                        PartyNumOfTable: e.DDT_NOTE,
                        PartySubTotal: e.DDT_SOBANTIEC,
                        PartyState: e.DDT_TRANGTHAI,
                    })
                })
                resolve(parties)
            })
        })
    }

    async get(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ddt.DDT_MADON, ddt.DDT_LOAITIEC, ddt.DDT_DIADIEM	, ddt.DDT_NGAYGIODAI, ddt.DDT_SOBANTIEC, ddt.DDT_NGAYGIO, ddt.DDT_TONGTIEN, ddt.DDT_NOTE, ddt.DDT_TRANGTHAI ,
                kh.KH_MAKH,kh.KH_TENKH, kh.KH_SDT,
                nvpt.NVPT_MANV, nvpt.NVPT_TENNV,
                ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) MA_SLUG, lma.LMA_TENLOAI,
                ama.AMA_URL,
                ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN
                FROM don_dat_tiec ddt
                JOIN khach_hang kh on ddt.KH_MAKH = kh.KH_MAKH
                JOIN nhan_vien_phu_trach nvpt on ddt.NVPT_MANV = nvpt.NVPT_MANV
                JOIN chi_tiet_don_dat_tiec ctddt on ddt.ddt_MADON = ctddt.ddt_MADON
                JOIN chi_tiet_mon_an ctma on ctddt.CTMA_MACT = ctma.CTMA_MACT
                JOIN mon_an ma on ctma.MA_MAMON = ma.MA_MAMON
                JOIN loai_mon_an lma on ma.LMA_MALOAI = lma.LMA_MALOAI
                JOIN anh_mon_an ama on ma.MA_MAMON = ama.MA_MAMON 
                WHERE ddt.ddt_MADON = ?
                GROUP BY ma.MA_MAMON`;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                let PartyDetails = []
                result.forEach(e => {
                    PartyDetails.push({
                        FoodId: e.MA_MAMON,
                        FoodName: e.MA_TENMON,
                        FoodSlug: e.MA_SLUG,
                        FoodType: e.LMA_TENLOAI,
                        FoodThumb: `https://drive.google.com/uc?id=${e.AMA_URL}`,
                        FoodPrice: e.CTMA_MUCGIA,
                        Total: parseInt(e.CTMA_MUCGIA) * parseInt(e.CTD_SOLUONG)
                    })
                })
                resolve(new Party(
                    result[0]['DDT_MADON'],
                    `${result[0]['KH_TENKH']} - ${result[0]['KH_SDT']}`,
                    result[0]['DDT_LOAITIEC'],
                    result[0]['DDT_NGAYGIODAI'],
                    result[0]['DDT_DIADIEM'],
                    result[0]['DDT_NOTE'],
                    result[0]['NV_TENNV'],
                    result[0]['DDT_NGAYGIO'],
                    PartyDetails,
                    result[0]['DDT_SOBANTIEC'],
                    result[0]['DDT_TONGTIEN'],
                    orderStatus.indexOf(result[0]['DDT_TRANGTHAI'])
                ))
            })
        })
    }

    async update(PartyCustomer, PartyID, PartyPlace, PartyTimeStart, PartyNumOfTable, PartyNote, PartyType) {
        return new Promise((resolve, reject) => {
            const sql = `call CAP_NHAT_DON_DAT_TIEC(?,?,?,?,?,?,?)`;
            dbConnect.query(sql, [PartyID, PartyCustomer, PartyPlace, PartyTimeStart, PartyNumOfTable, PartyNote, PartyType], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.changedRows))
            })
        });
    }

    async cancel(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_tiec SET DDT_TRANGTHAI = 'Đã hủy' 
                            WHERE DDT_MADON = ? `;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.affectedRow))
            })
        });
    }

    async verifyPartyWithCustomer(PartyCustomer, PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_tiec WHERE KH_MAKH = ? AND DDT_MADON = ? `;
            dbConnect.query(sql, [PartyCustomer, PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? true : false)
            })
        })
    }

    async checkIfPartyCouldBeUpdate(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_tiec WHERE DDT_MADON = ? AND DDT_TRANGTHAI <> 'Đã hủy' AND DDT_TRANGTHAI = 'Chờ xác nhận'`;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? true : false)
            })
        })
    }

    async getPartySubTotal(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT sum(ddt.DDT_SOBANTIEC * ctma.CTMA_MUCGIA) SUBTOTAL 
                        FROM chi_tiet_don_dat_tiec ctddt 
                        JOIN don_dat_tiec ddt on ddt.DDT_MADON = ctddt.DDT_MADON 
                        JOIN chi_tiet_mon_an ctma WHERE ctddt.CTMA_MACT = ctma.CTMA_MACT
                        AND DDT_MADON = ? `;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].SUBTOTAL : false)
            })
        })
    }

    async getAllForAdmin() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM don_dat_tiec
                        ORDER BY DDT_NGAYGIO DESC`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                let party = []
                result.forEach(e => {
                    party.push({
                        PartyID: e.DDT_MADON,
                        PartyDate: e.DDT_NGAYGIO,
                        PartyType: e.DDT_LOAITIEC,
                        PartyPlace: e.DDT_DIADIEM,
                        PartyTimeStart: e.DDT_NGAYGIODAI,
                        PartyNumOfTable: e.DDT_SOBANTIEC,
                        PartyNote: e.DDT_NOTE,
                        PartySubTotal: e.DDT_TONGTIEN,
                        PartyState: orderStatus.indexOf(e.DDT_TRANGTHAI),
                    })
                })
                resolve(party)
            })
        })
    }

    async get(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `
            SELECT ddt.DDT_MADON, ddt.DDT_LOAITIEC, ddt.DDT_DIADIEM	, ddt.DDT_NGAYGIODAI, ddt.DDT_SOBANTIEC, ddt.DDT_NGAYGIO, ddt.DDT_TONGTIEN, ddt.DDT_NOTE, ddt.DDT_TRANGTHAI ,
            kh.KH_MAKH,kh.KH_TENKH, kh.KH_SDT,                    
                nvpt.NVPT_MANV, nvpt.NVPT_TENNV,
                ma.MA_MAMON, ma.MA_TENMON, toSlug(ma.MA_TENMON) MA_SLUG, lma.LMA_TENLOAI,
                ama.AMA_URL,
                ctma.CTMA_MUCGIA, ctma.CTMA_KHAUPHAN
            FROM don_dat_tiec ddt
            JOIN khach_hang kh on ddt.KH_MAKH = kh.KH_MAKH
            JOIN nhan_vien_phu_trach nvpt on ddt.NVPT_MANV = nvpt.NVPT_MANV
            JOIN chi_tiet_don_dat_tiec ctddt on ddt.DDT_MADON = ctddt.DDT_MADON
            JOIN chi_tiet_mon_an ctma on ctddt.CTMA_MACT = ctma.CTMA_MACT
            JOIN mon_an ma on ctma.MA_MAMON = ma.MA_MAMON
            JOIN loai_mon_an lma on ma.LMA_MALOAI = lma.LMA_MALOAI
            JOIN anh_mon_an ama on ma.MA_MAMON = ama.MA_MAMON 
            WHERE ddt.DDT_MADON =?
            GROUP BY ctma.CTMA_MACT`;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length > 0) {
                    let PartyDetails = []
                    result.forEach(e => {
                        PartyDetails.push({
                            FoodId: e.MA_MAMON,
                            FoodName: e.MA_TENMON,
                            FoodSlug: e.MA_SLUG,
                            FoodType: e.LMA_TENLOAI,
                            FoodThumb: `https://drive.google.com/uc?id=${e.AMA_URL}`,
                            FoodPrice: e.CTMA_MUCGIA,
                            FoodRation: e.CTMA_KHAUPHAN,
                            FoodQuantity: e.CTD_SOLUONG,
                            Total: parseInt(e.CTMA_MUCGIA) * parseInt(e.DDT_SOBANTIEC)
                        })
                    })
                    resolve(new Party(
                        result[0]['DDT_MADON'],
                        `${result[0]['KH_TENKH']} - ${result[0]['KH_SDT']}`,
                        result[0]['DDT_LOAITIEC'],
                        result[0]['DDT_NGAYGIODAI'],
                        result[0]['DDT_DIADIEM'],
                        result[0]['DDT_NOTE'],
                        result[0]['NVPT_TENNV'],
                        result[0]['DDT_NGAYGIO'],
                        PartyDetails,
                        result[0]['DDT_SOBANTIEC'],
                        result[0]['DDT_TONGTIEN'],
                        orderStatus.indexOf(result[0]['DDT_TRANGTHAI'])
                    ))
                } else
                    resolve(false)
            })
        })
    }

    async getPartyStatus(PartyID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM don_dat_tiec WHERE DDT_MADON = ? AND DDT_TRANGTHAI <> 'Đã hủy'`;
            dbConnect.query(sql, [PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.length > 0) ? result[0].DDT_TRANGTHAI : false)
            })
        })
    }

    async updateForAdmin(PartyID, PartyState) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE don_dat_tiec SET DDT_TRANGTHAI = ?
                        WHERE DDT_MADON = ?`;
            dbConnect.query(sql, [PartyState, PartyID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve((result.affectedRow))
            })
        });
    }
}

module.exports = Party