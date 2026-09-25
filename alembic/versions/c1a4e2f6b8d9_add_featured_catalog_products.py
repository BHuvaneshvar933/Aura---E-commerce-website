"""Add the production featured catalog products.

Revision ID: c1a4e2f6b8d9
Revises: 815be9c1e7ce
Create Date: 2026-08-14
"""

import json
import uuid
from decimal import Decimal

from alembic import op
import sqlalchemy as sa


revision = "c1a4e2f6b8d9"
down_revision = "469d95608f92"
branch_labels = None
depends_on = None


FEATURED_PRODUCTS = (
    {
        "name": "Aura Signature Hoodie",
        "slug": "aura-signature-hoodie",
        "description": "Crafted from heavy-weight organic cotton, featuring a relaxed fit, custom embroidered logo, and timeless silhouette.",
        "price": Decimal("8500.00"),
        "attributes": {"brand": "AURA", "material": "Organic Cotton", "fit": "Relaxed", "care": "Machine wash cold"},
    },
    {
        "name": "Lumière Handbag",
        "slug": "lumiere-handbag",
        "description": "A structured evening bag crafted from smooth Italian leather, featuring bespoke gold-tone hardware and a suede-lined interior.",
        "price": Decimal("32000.00"),
        "attributes": {"brand": "AURA", "material": "Italian Leather", "hardware": "Gold-tone", "interior": "Suede"},
    },
    {
        "name": "Velvet Evening Dress",
        "slug": "velvet-evening-dress",
        "description": "Floor-length elegance tailored from rich midnight velvet, complete with a plunging neckline and subtle thigh slit.",
        "price": Decimal("45000.00"),
        "attributes": {"brand": "AURA", "material": "Premium Velvet", "color": "Midnight Black", "style": "Evening"},
    },
    {
        "name": "Obsidian Sunglasses",
        "slug": "obsidian-sunglasses",
        "description": "Hand-polished acetate frames featuring polarized, scratch-resistant lenses with 100% UV protection.",
        "price": Decimal("12500.00"),
        "attributes": {"brand": "AURA", "material": "Acetate", "lenses": "Polarized", "uv_protection": "100%"},
    },
)


def upgrade() -> None:
    connection = op.get_bind()
    category_id = connection.execute(
        sa.text("SELECT id FROM categories WHERE name = :name ORDER BY id LIMIT 1"),
        {"name": "Electronics"},
    ).scalar_one_or_none()

    if category_id is None:
        category_id = uuid.uuid4()
        connection.execute(
            sa.text("INSERT INTO categories (id, name, slug, is_deleted) VALUES (:id, :name, :slug, false)"),
            {"id": category_id, "name": "Electronics", "slug": "electronics"},
        )

    for product in FEATURED_PRODUCTS:
        existing_id = connection.execute(
            sa.text("SELECT id FROM products WHERE name = :name LIMIT 1"),
            {"name": product["name"]},
        ).scalar_one_or_none()
        values = {**product, "attributes": json.dumps(product["attributes"]), "category_id": category_id}

        if existing_id is None:
            connection.execute(
                sa.text(
                    """
                    INSERT INTO products (id, name, slug, description, price, stock_quantity, is_deleted, attributes, category_id, low_stock_threshold, reorder_point)
                    VALUES (:id, :name, :slug, :description, :price, 100, false, CAST(:attributes AS jsonb), :category_id, 10, 5)
                    """
                ),
                {**values, "id": uuid.uuid4()},
            )
        else:
            connection.execute(
                sa.text(
                    """
                    UPDATE products
                    SET description = :description, price = :price, attributes = CAST(:attributes AS jsonb),
                        category_id = :category_id, is_deleted = false
                    WHERE id = :id
                    """
                ),
                {**values, "id": existing_id},
            )


def downgrade() -> None:
    op.get_bind().execute(
        sa.text("DELETE FROM products WHERE name IN :names").bindparams(sa.bindparam("names", expanding=True)),
        {"names": [product["name"] for product in FEATURED_PRODUCTS]},
    )
