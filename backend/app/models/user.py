from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class AppUser(Base, TimestampMixin):
    __tablename__ = "app_users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    display_name = Column(Text)
    locale = Column(Text, default="fi-FI")
    currency_code = Column(Text, default="EUR")
    
    # Relationships
    households = relationship("Household", back_populates="owner")
    household_memberships = relationship("HouseholdMember", back_populates="user")
    planners = relationship("Planner", back_populates="owner_user")

class Household(Base, TimestampMixin):
    __tablename__ = "households"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False)
    
    # Relationships
    owner = relationship("AppUser", back_populates="households")
    members = relationship("HouseholdMember", back_populates="household")
    planners = relationship("Planner", back_populates="household")

class HouseholdMember(Base, TimestampMixin):
    __tablename__ = "household_members"
    
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"), primary_key=True)
    role = Column(Text, nullable=False, default="editor")
    
    # Relationships
    household = relationship("Household", back_populates="members")
    user = relationship("AppUser", back_populates="household_memberships")
