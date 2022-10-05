const express = require('express')
const router = express.Router();
require('dotenv').config()
router.get('/get-districts', async (req, res) => {
    return res.status(200).json({
        success: true,
        districts: [
            {
                districtid: "NK",
                districtname: "Quận Ninh Kiều"
            },
            {
                districtid: "CR",
                districtname: "Quận Cái Răng"
            },
            {
                districtid: "BT",
                districtname: "Quận Bình Thuỷ"
            },
            {
                districtid: "TN",
                districtname: "Quận Thốt Nốt"
            },
            {
                districtid: "OM",
                districtname: "Quận Ô Môn"
            },
            {
                districtid: "CD",
                districtname: "Huyện Cờ Đỏ"
            },
            {
                districtid: "PD",
                districtname: "Huyện Phong Điền"
            },
            {
                districtid: "TL",
                districtname: "Huyện Thới Lai"
            },
            {
                districtid: "VT",
                districtname: "Huyện Vĩnh Thạnh"
            }
        ]
    })
})

router.get('/get-wards/:districtid', async (req, res) => {
    const districtid = req.params.districtid
    switch (districtid) {
        case "NK":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "NKCK",
                        wardname: "Phường Cái Khế"
                    },
                    {
                        wardid: "NKAH",
                        wardname: "Phường An Hòa"
                    },
                    {
                        wardid: "NKTB",
                        wardname: "Phường Thới Bình"
                    },
                    {
                        wardid: "NKAN",
                        wardname: "Phường An Nghiệp"
                    },
                    {
                        wardid: "NKAC",
                        wardname: "Phường An Cư"
                    },
                    {
                        wardid: "NKTA",
                        wardname: "Phường Tân An"
                    },
                    {
                        wardid: "NKAP",
                        wardname: "Phường An Phú"
                    },
                    {
                        wardid: "NKXK",
                        wardname: "Phường Xuân Khánh"
                    },
                    {
                        wardid: "NKHL",
                        wardname: "Phường Hưng Lợi"
                    },
                    {
                        wardid: "NKAK",
                        wardname: "Phường An Khánh"
                    },
                    {
                        wardid: "NKAB",
                        wardname: "Phường An Bình"
                    }
                ]
            })
        case "CR":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "CRLB",
                        wardname: "Phường Lê Bình"
                    },
                    {
                        wardid: "CRHP",
                        wardname: "Phường Hưng Phú"
                    },
                    {
                        wardid: "CRHT",
                        wardname: "Phường Hưng Thạnh"
                    },
                    {
                        wardid: "CRBL",
                        wardname: "Phường Ba Láng"
                    },
                    {
                        wardid: "CRTT",
                        wardname: "Phường Thường Thạnh"
                    },
                    {
                        wardid: "CRPT",
                        wardname: "Phường Phú Thứ"
                    },
                    {
                        wardid: "CRTP",
                        wardname: "Phường Tân Phú"
                    }
                ]
            })
        case "BT":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "BTBT",
                        wardname: "Phường Bình Thủy"
                    },
                    {
                        wardid: "BTTA",
                        wardname: "Phường Trà An"
                    },
                    {
                        wardid: "BTTN",
                        wardname: "Phường Trà Nóc"
                    },
                    {
                        wardid: "BTTAD",
                        wardname: "Phường Thới An Đông"
                    },
                    {
                        wardid: "BTAT",
                        wardname: "Phường An Thới"
                    },
                    {
                        wardid: "BTBHN",
                        wardname: "Phường Bùi Hữu Nghĩa"
                    },
                    {
                        wardid: "BTLH",
                        wardname: "Phường Long Hòa"
                    },
                    {
                        wardid: "BTLT",
                        wardname: "Phường Long Tuyền"
                    }
                ]
            })
        case "TN":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "TNTNot",
                        wardname: "Phường Thốt Nốt"
                    },
                    {
                        wardid: "TNTT",
                        wardname: "Phường Thới Thuận"
                    },
                    {
                        wardid: "TNTA",
                        wardname: "Phường Thuận An"
                    },
                    {
                        wardid: "TNTL",
                        wardname: "Phường Tân Lộc"
                    },
                    {
                        wardid: "TNTN",
                        wardname: "Phường Trung Nhứt"
                    },
                    {
                        wardid: "TNTHoa",
                        wardname: "Phường Thạnh Hoà"
                    },
                    {
                        wardid: "TNTK",
                        wardname: "Phường Trung Kiên"
                    },
                    {
                        wardid: "TNTHung",
                        wardname: "Phường Tân Hưng"
                    },
                    {
                        wardid: "TNThuanHung",
                        wardname: "Phường Thuận Hưng"
                    }
                ]
            })
        case "OM":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "OMCVL",
                        wardname: "Phường Châu Văn Liêm"
                    },
                    {
                        wardid: "OMTH",
                        wardname: "Phường Thới Hòa"
                    },
                    {
                        wardid: "OMTL",
                        wardname: "Phường Thới Long"
                    },
                    {
                        wardid: "OMLH",
                        wardname: "Phường Long Hưng"
                    },
                    {
                        wardid: "OMTA",
                        wardname: "Phường Thới An"
                    },
                    {
                        wardid: "OMPT",
                        wardname: "Phường Phước Thới"
                    },
                    {
                        wardid: "OMTL",
                        wardname: "Phường Trường Lạc"
                    }
                ]
            })
        case "CD":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "CDTA",
                        wardname: "Xã Trung An"
                    },
                    {
                        wardid: "CDTT",
                        wardname: "Xã Trung Thạnh"
                    },
                    {
                        wardid: "CDTP",
                        wardname: "Xã Thạnh Phú"
                    },
                    {
                        wardid: "CDTH",
                        wardname: "Xã Trung Hưng"
                    },
                    {
                        wardid: "CDTTCD",
                        wardname: "Thị trấn Cờ Đỏ"
                    },
                    {
                        wardid: "CDThoiHung",
                        wardname: "Xã Thới Hưng"
                    },
                    {
                        wardid: "CDDH",
                        wardname: "Xã Đông Hiệp"
                    },
                    {
                        wardid: "CDDT",
                        wardname: "Xã Đông Thắng"
                    },
                    {
                        wardid: "CDTD",
                        wardname: "Xã Thới Đông"
                    },
                    {
                        wardid: "CDTX",
                        wardname: "Xã Thới Xuân"
                    }
                ]
            })
        case "PD":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "PDTTPD",
                        wardname: "Thị trấn Phong Điền"
                    },
                    {
                        wardid: "PDNA",
                        wardname: "Xã Nhơn Ái"
                    },
                    {
                        wardid: "PDGX",
                        wardname: "Xã Giai Xuân"
                    },
                    {
                        wardid: "PDTT",
                        wardname: "Xã Tân Thới"
                    },
                    {
                        wardid: "PDTL",
                        wardname: "Xã Trường Long"
                    },
                    {
                        wardid: "PDMK",
                        wardname: "Xã Mỹ Khánh"
                    },
                    {
                        wardid: "PDNN",
                        wardname: "Xã Nhơn Nghĩa"
                    }
                ]
            })
        case "TL":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "TLTTTL",
                        wardname: "Thị trấn Thới Lai"
                    },
                    {
                        wardid: "TLThoiThanh",
                        wardname: "Xã Thới Thạnh"
                    },
                    {
                        wardid: "TLTanThanh",
                        wardname: "Xã Tân Thạnh"
                    },
                    {
                        wardid: "TLXT",
                        wardname: "Xã Xuân Thắng"
                    },
                    {
                        wardid: "TLDB",
                        wardname: "Xã Đông Bình"
                    },
                    {
                        wardid: "TLDT",
                        wardname: "Xã Đông Thuận"
                    },
                    {
                        wardid: "TLThoiTan",
                        wardname: "Xã Thới Tân"
                    },
                    {
                        wardid: "TLTruongThang",
                        wardname: "Xã Trường Thắng"
                    },
                    {
                        wardid: "TLDM",
                        wardname: "Xã Định Môn"
                    },
                    {
                        wardid: "TLTruongThanh",
                        wardname: "Xã Trường Thành"
                    },
                    {
                        wardid: "TLTX",
                        wardname: "Xã Trường Xuân"
                    },
                    {
                        wardid: "TLTXA",
                        wardname: "Xã Trường Xuân A"
                    },
                    {
                        wardid: "TLTXB",
                        wardname: "Xã Trường Xuân B"
                    }
                ]
            })
        case "VT":
            return res.status(200).json({
                success: true,
                wards: [
                    {
                        wardid: "VTVB",
                        wardname: "Xã Vĩnh Bình"
                    },
                    {
                        wardid: "VTTTTA",
                        wardname: "Thị trấn Thanh An"
                    },
                    {
                        wardid: "VTTTVT",
                        wardname: "Thị trấn Vĩnh Thạnh"
                    },
                    {
                        wardid: "VTTM",
                        wardname: "Xã Thạnh Mỹ"
                    },
                    {
                        wardid: "VTVT",
                        wardname: "Xã Vĩnh Trinh"
                    },
                    {
                        wardid: "VTTA",
                        wardname: "Xã Thạnh An"
                    },
                    {
                        wardid: "VTTTien",
                        wardname: "Xã Thạnh Tiến"
                    },
                    {
                        wardid: "VTTThang",
                        wardname: "Xã Thạnh Thắng"
                    },
                    {
                        wardid: "VTTLoi",
                        wardname: "Xã Thạnh Lợi"
                    },
                    {
                        wardid: "VTTQ",
                        wardname: "Xã Thạnh Quới"
                    },
                    {
                        wardid: "VTTLoc",
                        wardname: "Xã Thạnh Lộc"
                    }
                ]
            })
        default:
            return res.status(200).json({
                success: false,
                message: "Quý khách chưa chọn quận/huyện"
            })
    }
})
module.exports = router