const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const router = express.Router();
const dbConnect = require('./dbconnect');

class Customer {

    constructor(CustomerId, CustomerName, CustomerPhone, CustomerEmail, CustomerPassword, CustomerState) {
        this.CustomerId = CustomerId;
        this.CustomerName = CustomerName;
        this.CustomerPhone = CustomerPhone;
        this.CustomerEmail = CustomerEmail;
        this.CustomerPassword = CustomerPassword;
        this.CustomerState = CustomerState;
    };
    async updatePassword(CustomerId, CustomerPassword) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE khach_hang SET KH_MATKHAU = ? WHERE KH_MAKH = ?";
            dbConnect.query(sql, [CustomerPassword, CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }

            })
        });
    }
    async updateInfo(CustomerId, CustomerPhone, CustomerName, CustomerEmail) {
        return new Promise((resolve, reject) => {
            const sql = "call CAP_NHAT_KHACH_HANG(?,?,?,?)";
            dbConnect.query(sql, [CustomerId, CustomerPhone, CustomerName, CustomerEmail], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    resolve(result.affectedRows)
                }

            })
        });
    }
    async findWithPassword(CustomerPhone) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI FROM khach_hang WHERE KH_SDT = ?";
            dbConnect.query(sql, [CustomerPhone], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    if (result.length > 0)
                        resolve(new Customer(result[0].KH_MAKH, result[0].KH_TENKH, result[0].KH_SDT, result[0].KH_EMAIL, result[0].KH_MATKHAU, result[0].KH_TRANGTHAI));
                    else
                        resolve(new Customer())
                }

            })
        });
    }
    async findWithId(CustomerId) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI FROM khach_hang WHERE KH_MAKH = ?";
            dbConnect.query(sql, [CustomerId], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    if (result.length > 0)
                        resolve(new Customer(result[0].KH_MAKH, result[0].KH_TENKH, result[0].KH_SDT, result[0].KH_EMAIL, result[0].KH_MATKHAU, result[0].KH_TRANGTHAI));
                    else
                        resolve(new Customer(null, null, null, null, null))
                }

            })
        });
    }
    async find(CustomerPhone) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_TRANGTHAI FROM khach_hang WHERE KH_SDT = ?";
            dbConnect.query(sql, [CustomerPhone], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    if (result.length > 0)
                        resolve(new Customer(result[0].KH_MAKH, result[0].KH_TENKH, result[0].KH_SDT, result[0].KH_EMAIL, null, result[0].KH_TRANGTHAI));
                    else
                        resolve(new Customer())
                }

            })
        });
    }
    async create(CustomerId, CustomerName, CustomerPhone, CustomerEmail, CustomerPassword, CustomerState) {
        return new Promise((resolve, reject) => {
            const sql = "call THEM_KHACH_HANG (?, ?, ?)";
            // const sql = "INSERT INTO khach_hang(KH_MAKH, KH_TENKH, KH_SDT, KH_EMAIL, KH_MATKHAU, KH_TRANGTHAI) VALUES (?,?,?,?,?,?)";
            dbConnect.query(sql, [CustomerName, CustomerPhone, CustomerPassword], (err, result) => {
                if (err) {
                    return reject(err)
                }
                else {
                    if (result.affectedRows == 1)
                        resolve(new Customer(CustomerId, CustomerName, CustomerPhone, CustomerEmail, null, CustomerState));
                    else
                        resolve(new Customer())
                }

            })
        });
    }

    async getAllForAdmin() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM khach_hang`
            dbConnect.query(sql, [], (err, result) => {
                if (err)
                    return reject(err)
                let customers = []
                result.forEach(e => {
                    customers.push(
                        new Customer(
                            e.KH_MAKH,
                            e.KH_TENKH,
                            e.KH_SDT,
                            e.KH_EMAIL,
                            null,
                            e.KH_TRANGTHAI)
                    );
                })
                resolve(customers)
            })
        })
    }
}

module.exports = Customer;