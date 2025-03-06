from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from decimal import Decimal

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Модели базы данных
class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    markup_percentage = db.Column(db.Float, default=0)
    invoices = db.relationship('Invoice', backref='client', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'markup_percentage': self.markup_percentage,
            'debt': sum([t.amount for t in Transaction.query.filter_by(client_id=self.id)])
        }


class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    commission_percentage = db.Column(db.Float, default=0)
    invoices = db.relationship('Invoice', backref='supplier', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'commission_percentage': self.commission_percentage
        }


class Material(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price
        }


class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'), nullable=True)
    total_amount = db.Column(db.Float, default=0)
    materials = db.relationship('InvoiceMaterial', backref='invoice', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d %H:%M:%S'),
            'client_id': self.client_id,
            'client_name': Client.query.get(self.client_id).name,
            'supplier_id': self.supplier_id,
            'supplier_name': Supplier.query.get(self.supplier_id).name if self.supplier_id else None,
            'total_amount': self.total_amount,
            'materials': [m.to_dict() for m in self.materials]
        }


class InvoiceMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    material = db.relationship('Material')

    def to_dict(self):
        material = Material.query.get(self.material_id)
        return {
            'id': self.id,
            'material_id': self.material_id,
            'material_name': material.name,
            'quantity': self.quantity,
            'price': self.price,
            'total': self.quantity * self.price
        }


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d %H:%M:%S'),
            'client_id': self.client_id,
            'client_name': Client.query.get(self.client_id).name,
            'invoice_id': self.invoice_id,
            'amount': self.amount,
            'description': self.description
        }


with app.app_context():
    db.create_all()


@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([client.to_dict() for client in clients])


@app.route('/api/clients', methods=['POST'])
def add_client():
    data = request.json
    client = Client(name=data['name'], markup_percentage=data['markup_percentage'])
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([supplier.to_dict() for supplier in suppliers])


@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    data = request.json
    supplier = Supplier(name=data['name'], commission_percentage=data['commission_percentage'])
    db.session.add(supplier)
    db.session.commit()
    return jsonify(supplier.to_dict()), 201


@app.route('/api/materials', methods=['GET'])
def get_materials():
    materials = Material.query.all()
    return jsonify([material.to_dict() for material in materials])


@app.route('/api/materials', methods=['POST'])
def add_material():
    data = request.json
    material = Material(name=data['name'], price=data['price'])
    db.session.add(material)
    db.session.commit()
    return jsonify(material.to_dict()), 201


@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([invoice.to_dict() for invoice in invoices])


@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify(invoice.to_dict())


@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    data = request.json
    client = Client.query.get_or_404(data['client_id'])
    markup_percentage = client.markup_percentage

    invoice = Invoice(
        client_id=data['client_id'],
        supplier_id=data.get('supplier_id')
    )
    db.session.add(invoice)
    db.session.flush()

    total_materials_cost = 0
    for item in data['materials']:
        material = Material.query.get_or_404(item['material_id'])
        invoice_material = InvoiceMaterial(
            invoice_id=invoice.id,
            material_id=item['material_id'],
            quantity=item['quantity'],
            price=material.price
        )
        db.session.add(invoice_material)
        total_materials_cost += material.price * item['quantity']

    invoice.total_amount = total_materials_cost

    materials_transaction = Transaction(
        client_id=client.id,
        invoice_id=invoice.id,
        amount=-total_materials_cost,  # отрицательное значение = долг
        description="Стоимость материалов"
    )
    db.session.add(materials_transaction)

    markup_amount = total_materials_cost * (markup_percentage / 100)
    markup_transaction = Transaction(
        client_id=client.id,
        invoice_id=invoice.id,
        amount=-markup_amount,  # отрицательное значение = долг
        description="Наценка"
    )
    db.session.add(markup_transaction)

    if data.get('supplier_id'):
        supplier = Supplier.query.get_or_404(data['supplier_id'])
        commission_amount = total_materials_cost * (supplier.commission_percentage / 100)

        supplier_transaction = Transaction(
            client_id=client.id,
            invoice_id=invoice.id,
            amount=-commission_amount,
            description="Комиссия поставщика"
        )
        db.session.add(supplier_transaction)

    db.session.commit()
    return jsonify(invoice.to_dict()), 201


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    client_id = request.args.get('client_id')
    if client_id:
        transactions = Transaction.query.filter_by(client_id=client_id).all()
    else:
        transactions = Transaction.query.all()
    return jsonify([transaction.to_dict() for transaction in transactions])


@app.route('/api/clients/<int:client_id>/debt', methods=['GET'])
def get_client_debt(client_id):
    client = Client.query.get_or_404(client_id)
    transactions = Transaction.query.filter_by(client_id=client_id).all()
    total_debt = sum([t.amount for t in transactions])
    return jsonify({
        'client_id': client_id,
        'client_name': client.name,
        'total_debt': total_debt
    })


if __name__ == '__main__':
    with app.app_context():
        if not Client.query.first():
            test_client = Client(name="фывasd", markup_percentage=12.3)
            test_supplier = Supplier(name="Поставщик Тест", commission_percentage=5)
            test_material = Material(name="Тестовый материал", price=1234.0)

            db.session.add_all([test_client, test_supplier, test_material])
            db.session.commit()

            print("Тестовые данные добавлены")

    app.run(debug=True)