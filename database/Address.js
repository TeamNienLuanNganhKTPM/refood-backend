const dbConnect = require('./dbconnect');

class Address {
    constructor(AddressId, CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress) {
        this.AddressId = AddressId
        this.AddressRecieverName = CustomerName
        this.AddressRecieverPhone = CustomerPhone
        this.AddressNumAndStreetName = AddressNumAndStreetName
        this.AddressWard = AddressWard
        this.AddressDistrict = AddressDistrict
        this.isDefaultAddress = isDefaultAddress
    }
    async getAllAddresses(CustomerId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM DIA_CHI WHERE KH_MAKH = ?`;
                dbConnect.query(sql, [CustomerId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            let addresses = []
                            result.forEach(address => {
                                addresses.push(
                                    new Address(
                                        address['DC_MADC'],
                                        address['DC_NGUOINHAN'],
                                        address['DC_SDTNHAN'],
                                        address['DC_DIACHI'],
                                        address['DC_TENPHUONG'],
                                        address['DC_TENQUANHUYEN'],
                                        address['DC_isDefault'],
                                    )
                                )
                            });
                            resolve(addresses)
                        } else
                            resolve(new Address());
                        // resolve(new Address(result[0][0]['@AddressId'], CustomerName, CustomerPhone, AddressStreetName, AddressWard, AddressDistrict, AddressApartmentNumber, isDefaultAddress))
                    }

                })
            })
        });
    }

    async getAddressDetail(CustomerId, AddressId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `SELECT * FROM DIA_CHI WHERE KH_MAKH = ? AND DC_MADC = ?`;
                dbConnect.query(sql, [CustomerId, AddressId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.length > 0) {
                            resolve(
                                new Address(
                                    result[0]['DC_MADC'],
                                    result[0]['DC_NGUOINHAN'],
                                    result[0]['DC_SDTNHAN'],
                                    result[0]['DC_DIACHI'],
                                    result[0]['DC_TENPHUONG'],
                                    result[0]['DC_TENQUANHUYEN'],
                                    result[0]['DC_isDefault'],
                                ))
                        } else
                            resolve(new Address(null, null, null, null, null, null, null));
                    }

                })
            })
        });
    }

    async addAddress(CustomerId, CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `call THEM_DIA_CHI(?,?,?,?,?,?,?,@AddressId)`;
                dbConnect.query(sql, [CustomerId, CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        resolve(new Address(result[0][0]['@AddressId'], CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress))
                    }

                })
            })
        });
    }

    async updateAddress(AddressId, CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                if (isDefaultAddress) {
                    let sql = ` UPDATE dia_chi SET DC_isDefault = 0 WHERE(KH_MAKH = KH_MAKH)`;
                    dbConnect.query(sql)
                }
                const sql = `
                UPDATE dia_chi 
                SET DC_NGUOINHAN = ?, 
                DC_SDTNHAN = ?, 
                DC_DIACHI = ?, 
                DC_TENPHUONG = ?, 
                DC_TENQUANHUYEN = ?, 
                DC_isDefault = ? 
                WHERE DC_MADC = ?`;
                dbConnect.query(sql, [CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress, AddressId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        if (result.affectedRows == 1)
                            resolve(new Address(AddressId, CustomerName, CustomerPhone, AddressNumAndStreetName, AddressWard, AddressDistrict, isDefaultAddress))
                        else
                            resolve(new Address(null, null, null, null, null, null, null))
                    }

                })
            })
        });
    }

    async deleteAddress(CustomerId, AddressId) {
        return new Promise((resolve, reject) => {
            dbConnect.connect(() => {
                const sql = `
                DELETE FROM dia_chi WHERE DC_MADC = ? AND KH_MAKH = ?`;
                dbConnect.query(sql, [AddressId, CustomerId], (err, result) => {
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

module.exports = Address