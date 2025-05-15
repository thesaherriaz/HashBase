import json
import re
import copy
from datetime import datetime
import threading

def convert_value(value, data_type):
     if data_type == "int":
        try:
            return int(value)  # Convert to integer
        except ValueError:
            return None  # If conversion fails, return None (invalid value)
     elif data_type == "bool":
        if value.lower() in ["true", "1", "t", "y", "yes"]:
            return True
        elif value.lower() in ["false", "0", "f", "n", "no"]:
            return False
        else:
            return None  # If invalid value, return None
    
     elif data_type == "string":
        return str(value)  # Convert to string
     return value  # Return the value as is if type is unknown
 
class TransactionManager:
    def __init__(self, db):
        self.db = db
        self.active_transactions = {}
        self.transaction_lock = threading.RLock()
        self.checkpoints = {}
        self.locks = {}  # {(table_name, key): {'read': set(), 'write': None}}
        self.lock_queue = {}  # {(table_name, key): [waiting_transactions]}
        
    def acquire_lock(self, transaction_id, table_name, key, lock_type='read'):
        with self.transaction_lock:
            lock_key = (table_name, key)

            if lock_key not in self.locks:
                self.locks[lock_key] = {'read': set(), 'write': None}
                self.lock_queue[lock_key] = []

            current_locks = self.locks[lock_key]

            if lock_type == 'read' and transaction_id in current_locks['read']:
                return True
            if lock_type == 'write' and transaction_id == current_locks['write']:
                return True

            if lock_type == 'read':
                if current_locks['write'] is None:
                        current_locks['read'].add(transaction_id)
                        self.active_transactions[transaction_id]['locks'].add(lock_key)
                        return True
            elif lock_type == 'write':
                if not current_locks['read'] and current_locks['write'] is None:
                        current_locks['write'] = transaction_id
                        self.active_transactions[transaction_id]['locks'].add(lock_key)
                        return True

            self.lock_queue[lock_key].append((transaction_id, lock_type))
            return False

    
    def release_locks(self, transaction_id):
        with self.transaction_lock:
            print(f"[DEBUG] Releasing locks for {transaction_id}...")
            print("[DEBUG] Locks held:", self.active_transactions[transaction_id]['locks'])
            for lock_key in list(self.active_transactions[transaction_id]['locks']):
                current_locks = self.locks[lock_key]

                if transaction_id in current_locks['read']:
                    current_locks['read'].remove(transaction_id)
                if transaction_id == current_locks['write']:
                    current_locks['write'] = None

                self._process_lock_queue(lock_key)

            self.active_transactions[transaction_id]['locks'].clear()


    
    def _process_lock_queue(self, lock_key):
        current_locks = self.locks[lock_key]
        queue = self.lock_queue[lock_key]

        i = 0
        while i < len(queue):
                waiting_transaction, lock_type = queue[i]

                if lock_type == 'read' and current_locks['write'] is None:
                        current_locks['read'].add(waiting_transaction)
                        self.active_transactions[waiting_transaction]['locks'].add(lock_key)
                        queue.pop(i)
                elif lock_type == 'write' and not current_locks['read'] and current_locks['write'] is None:
                        current_locks['write'] = waiting_transaction
                        self.active_transactions[waiting_transaction]['locks'].add(lock_key)
                        queue.pop(i)
                else:
                        i += 1  

    def begin_transaction(self, transaction_id):
        with self.transaction_lock:
                if transaction_id in self.active_transactions:
                        return f"Transaction {transaction_id} already exists!"

                self.checkpoints[transaction_id] = copy.deepcopy(self.db.tables)
                self.active_transactions[transaction_id] = {
                        'status': 'active',
                        'operations': [],
                        'locks': set()  # ✅ this was missing or not initialized properly
                }
                return f"Transaction {transaction_id} started successfully."

    
    def commit_transaction(self, transaction_id):
        print("in commit func")
        with self.transaction_lock:
            if transaction_id not in self.active_transactions:
                return f"Transaction {transaction_id} does not exist!"
            
            if self.active_transactions[transaction_id]['status'] != 'active':
                return f"Transaction {transaction_id} is not active!"
            
            # Release all locks
            self.release_locks(transaction_id)
            print("in commit func 2")
            
            self.active_transactions[transaction_id]['status'] = 'committed'
            if transaction_id in self.checkpoints:
                del self.checkpoints[transaction_id]
        
            print("in commit func3")
            self.db.save_to_file()
            print("in commit func4")
            return f"Transaction {transaction_id} committed successfully."
        print("in commit func4")
    
    def rollback_transaction(self, transaction_id):
        with self.transaction_lock:
            if transaction_id not in self.active_transactions:
                return f"Transaction {transaction_id} does not exist!"
            
            # Release all locks
            self.release_locks(transaction_id)
            
            if transaction_id in self.checkpoints:
                self.db.tables = copy.deepcopy(self.checkpoints[transaction_id])
                del self.checkpoints[transaction_id]
            
            self.active_transactions[transaction_id]['status'] = 'rolled back'
            return f"Transaction {transaction_id} rolled back successfully."
    
    def is_transaction_active(self, transaction_id):
        with self.transaction_lock:
            return (transaction_id in self.active_transactions and
                    self.active_transactions[transaction_id]['status'] == 'active')
    
    def log_operation(self, transaction_id, operation, *args, **kwargs):
        with self.transaction_lock:
            if transaction_id not in self.active_transactions:
                return False
            
            self.active_transactions[transaction_id]['operations'].append({
                'operation': operation,
                'args': args,
                'kwargs': kwargs,
                'timestamp': datetime.now()
            })
            return True
class Database:
    def __init__(self, file_name="database.json"):
        self.tables = {}
        print("DEBUG: Initializing Database...")
        self.file_name = file_name
        self.indexer = Indexer(self)  # Initialize the indexer
        self.transaction_manager = TransactionManager(self)
        self.implicit_transaction_counter = 0
        self.load_from_file()
        print(f"Database initialized with tables: {self.tables}")
        
    def _get_implicit_transaction_id(self):
        self.implicit_transaction_counter += 1
        return f"implicit_transaction_{self.implicit_transaction_counter}"

    def begin_transaction(self, transaction_id):
        return self.transaction_manager.begin_transaction(transaction_id)
    
    def commit_transaction(self, transaction_id):
        return self.transaction_manager.commit_transaction(transaction_id)
    
    def rollback_transaction(self, transaction_id):
        return self.transaction_manager.rollback_transaction(transaction_id)
    
    def is_transaction_active(self, transaction_id):
        return self.transaction_manager.is_transaction_active(transaction_id)

    def create_table(self, table_name, columns, constraints=None, transaction_id=None):
        # Handle implicit transactions if no transaction_id is provided
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        table_name = table_name.strip().lower()
        
        if not isinstance(self.tables, dict):
            self.tables = {}  # Ensure it's always a dictionary
            print("DEBUG: self.tables was not initialized, fixing it!")

        print(f"DEBUG: Checking existence of table '{table_name}' in", self.tables)

        if table_name in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' already exists!"
            
        formatted_columns = {}
        constraints = constraints or {}
        primary_keys = set()
        foreign_keys = {}
        for col in columns:
            col_parts = col.strip().split()
            if len(col_parts) != 2:
                if implicit_transaction:
                    self.transaction_manager.rollback_transaction(transaction_id)
                return f"Invalid column format: '{col}'. Expected format: column_name datatype"

            col_name, col_type = col_parts
            col_name = col_name.lower()
            col_type = col_type.lower()

            if col_type not in {"int", "string", "float", "bool", "char", "datetime"}:
                if implicit_transaction:
                    self.transaction_manager.rollback_transaction(transaction_id)
                return f"Unsupported data type: '{col_type}'"

            col_constraints = constraints.get(col_name, [])

            if "primary_key" in col_constraints:
                primary_keys.add(col_name)
            if "foreign_key" in col_constraints:
                foreign_keys[col_name] = col_constraints.get("foreign_key", None)

            formatted_columns[col_name] = {"type": col_type, "constraints": col_constraints}

        if len(primary_keys) > 1:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Only one primary key is allowed per table!"

        self.tables[table_name] = {
            "columns": formatted_columns,
            "records": {},
            "constraints": constraints,
            "primary_keys": list(primary_keys),
            "foreign_keys": foreign_keys,
        }
        
        # Log the operation and handle transaction
        self.transaction_manager.log_operation(transaction_id, 'create_table', table_name, columns, constraints)
        
        if implicit_transaction:
            result = self.transaction_manager.commit_transaction(transaction_id)
            if "successfully" not in result:
                return result
        
        return f"Table '{table_name}' created successfully."

    def get_table_columns(self, table_name, transaction_id=None):
        # For read operations, we can use a simple read lock
        if transaction_id and not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        if transaction_id:
            # This is a table-level operation, so we use a generic key
            if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
                return f"Could not acquire lock for {table_name}. Try again later."
            self.transaction_manager.log_operation(transaction_id, 'get_table_columns', table_name)
            
        return self.tables.get(table_name, {}).get("columns", None)

    def insert(self, table_name, key, values, transaction_id=None):
        # Handle implicit transactions if no transaction_id is provided
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}:{key}. Try again later."
                
        table_name = table_name.strip().lower()
        key = str(key).strip()

        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Table does not exist!"

        table = self.tables[table_name]
        columns = table["columns"]
        constraints = table.get("constraints", {})

        if isinstance(values, str):
            values_list = re.findall(r'"([^"]*)"|\'([^\']*)\'|([^,\s]+)', values)
            values_list = ["".join(match) for match in values_list]
        elif isinstance(values, list):
            values_list = values
        else:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Invalid input format!"

        if len(values_list) != len(columns):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Mismatch between column count and values!"

        record = {}
        for (col_name, col_details), value in zip(columns.items(), values_list):
            value = value.strip()
            col_type = col_details["type"]
            col_constraints = col_details.get("constraints", [])

            if "primary_key" in col_constraints and key in table["records"]:
                if implicit_transaction:
                    self.transaction_manager.rollback_transaction(transaction_id)
                return f"Primary Key violation: '{key}' already exists!"

            if "unique" in col_constraints:
                for existing_record in table["records"].values():
                    if existing_record.get(col_name) == value:
                        if implicit_transaction:
                            self.transaction_manager.rollback_transaction(transaction_id)
                        return f"Unique constraint violation: '{col_name}' must be unique!"

            if "foreign_key" in col_constraints:
                parent_table, parent_column = col_constraints["foreign_key"].split(".")
                if parent_table not in self.tables or value not in self.tables[parent_table]["records"]:
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Foreign Key violation: '{value}' not found in '{parent_table}.{parent_column}'"

            # Convert based on type
            if col_type == "int":
                if not value.isdigit():        
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Invalid value '{value}' for column '{col_name}' (Expected int)"
                value = int(value)
            elif col_type == "float":
                try:
                    value = float(value)
                except ValueError:
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Invalid value '{value}' for column '{col_name}' (Expected float)"
            elif col_type == "bool":
                if value.lower() not in {"true", "false"}:
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Invalid value '{value}' for column '{col_name}' (Expected bool: true/false)"
                value = value.lower() == "true"
            elif col_type == "char":
                if len(value) != 1:
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Invalid value '{value}' for column '{col_name}' (Expected CHAR - single character)"
            elif col_type == "datetime":
                if isinstance(value, str):
                    try:
                        value = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        if implicit_transaction:
                            self.transaction_manager.rollback_transaction(transaction_id)
                        return f"Invalid datetime format for '{col_name}', expected 'YYYY-MM-DD HH:MM:SS'."
                elif not isinstance(value, datetime):
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Invalid type for column '{col_name}', expected DATETIME."
            elif col_type == "string":
                value = value.strip('"').strip("'")

            record[col_name] = value

        if key in table["records"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Key already exists! Use UPDATE instead."

        table["records"][key] = record
        
        self.indexer.add_to_index(table_name, key, record)

        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'insert', table_name, key, values)
        
        # Handle transaction completion
        if implicit_transaction:
            result = self.transaction_manager.commit_transaction(transaction_id)
            if "successfully" not in result:
                return result
        
        return "Inserted successfully!"

    def get(self, table_name, key, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}:{key}. Try again later."
                
        table_name = table_name.strip().lower()
        key = str(key).strip()

        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Table does not exist!"
            
        if key not in self.tables[table_name]["records"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Key not found!"

        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'get', table_name, key)
        
        result = self.tables[table_name]["records"][key]
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return result

    def delete(self, table_name, key, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}:{key}. Try again later."
                
        table_name = table_name.strip().lower()
        key = str(key).strip()

        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Table does not exist!"
            
        if key not in self.tables[table_name]["records"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Key not found!"
        
        record = self.tables[table_name]["records"][key]
        self.indexer.delete_from_index(table_name, key, record)
        del self.tables[table_name]["records"][key]
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'delete', table_name, key)
        
        # Complete the implicit transaction
        if implicit_transaction:
            result = self.transaction_manager.commit_transaction(transaction_id)
            if "successfully" not in result:
                return result
                
        return "Deleted successfully!"
    
    def distinct(self, table_name, column, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
            
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        table = self.tables[table_name]
        
        # Check if the column exists
        if column not in table['columns']:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Column '{column}' does not exist in table '{table_name}'"
        
        distinct_values = set()
        
        # Get distinct values for the specified column
        for record in table['records'].values():
            distinct_values.add(record.get(column))
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'distinct', table_name, column)
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return list(distinct_values)
    
    def having(self, table_name, group_column, select_column, operator, value, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        # Ensure the table exists
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        table = self.tables[table_name]
        
        # Ensure the group_column exists in the table
        if group_column not in table["columns"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Column '{group_column}' does not exist in table '{table_name}'."
            
        # Group records by the group_column
        grouped_records = {}
        
        for row in table["records"].values():
            group_value = row.get(group_column)
            if group_value not in grouped_records:
                grouped_records[group_value] = 0
            grouped_records[group_value] += 1
            
        # Convert value to the correct type based on operator and comparison
        try:
            value = int(value)  # Try converting value to integer
        except ValueError:
            pass  # If it fails, leave value as a string
            
        # Apply HAVING condition
        filtered_groups = {}
        for group_value, count in grouped_records.items():
            if operator == ">" and count > value:
                filtered_groups[group_value] = count
            elif operator == "<" and count < value:
                filtered_groups[group_value] = count
            elif operator == "=" and count == value:
                filtered_groups[group_value] = count
            elif operator == ">=" and count >= value:
                filtered_groups[group_value] = count
            elif operator == "<=" and count <= value:
                filtered_groups[group_value] = count
            elif operator == "<>" and count != value:
                filtered_groups[group_value] = count
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'having', table_name, group_column, select_column, operator, value)
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return filtered_groups

    def inner_join(self, table1, table2, table1_column, table2_column, columns, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read locks on both tables
        if not self.transaction_manager.acquire_lock(transaction_id, table1, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table1}. Try again later."
                
        if not self.transaction_manager.acquire_lock(transaction_id, table2, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table2}. Try again later."
                
        # Make sure the tables exist
        if table1 not in self.tables or table2 not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Error: Tables {table1} or {table2} not found."
            
        # Get the column data from both tables
        table1_records = self.tables[table1]["records"]
        table2_records = self.tables[table2]["records"]
        
        # Perform the join
        joined_data = []
        for key1, record1 in table1_records.items():
            for key2, record2 in table2_records.items():
                # Check if the join condition is met
                if record1[table1_column] == record2[table2_column]:
                    # Prepare the result row by selecting the required columns
                    result_row = {}
                    for column in columns:
                        if column in record1:
                            result_row[column] = record1[column]
                        if column in record2:
                            result_row[column] = record2[column]
                    joined_data.append(result_row)
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'inner_join', table1, table2, table1_column, table2_column, columns)
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return joined_data


    def _apply_operator(self, left, operator, right):
     if operator == "=":
        return left == right
     elif operator == ">":
        return left > right
     elif operator == "<":
        return left < right
     elif operator == ">=":
        return left >= right
     elif operator == "<=":
         return left <= right
     elif operator == "<>":
        return left != right
     return False
 
    def group_by(self, table_name, group_column, column, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        table = self.tables[table_name]
        
        # Check if the group column exists
        if group_column not in table['columns']:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Group column '{group_column}' does not exist in table '{table_name}'"
        
        grouped_records = {}
        for record in table['records'].values():
            group_value = record.get(group_column)
            if group_value not in grouped_records:
                grouped_records[group_value] = []
            grouped_records[group_value].append(record)
        
        result = {}
        for group_value, records in grouped_records.items():
            result[group_value] = len(records)
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'group_by', table_name, group_column, column)
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return result

    def drop_column(self, table_name, column_name, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        table = self.tables[table_name]
        column_name = column_name.strip().lower()  # Ensure case consistency
        
        # Check if the column exists
        if column_name not in table["columns"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Column '{column_name}' does not exist in table '{table_name}'"
        
        # Remove the column from each record
        for record in table["records"].values():
            if column_name in record:
                del record[column_name]
        
        # Remove the column from the column definition
        del table["columns"][column_name]
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'drop_column', table_name, column_name)
        
        # Complete the implicit transaction
        if implicit_transaction:
            result = self.transaction_manager.commit_transaction(transaction_id)
            if "successfully" not in result:
                return result
                
        return f"Column '{column_name}' dropped from table '{table_name}'."

    def update(self, table_name, key, updates, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}:{key}. Try again later."
                
        table_name = table_name.strip().lower()
        key = str(key).strip()

        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Table does not exist!"
        
        table = self.tables[table_name]
        if key not in table["records"]:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return "Key not found!"

        column_types = table["columns"]

        for field, value in updates.items():
            field = field.strip().lower()

            if field in column_types:
                col_details = column_types[field]
                expected_type = column_types[field]
                constraints = col_details.get("constraints", [])
               
                if "primary_key" in constraints:
                    if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                    return f"Cannot update primary key '{field}'."
                
                if "unique" in constraints:
                    for existing_key, existing_record in table["records"].items():
                        if existing_key != key and existing_record.get(field) == value:
                            if implicit_transaction:
                                self.transaction_manager.rollback_transaction(transaction_id)
                            return f"Unique constraint violation: '{field}' must be unique!"
                
                if "foreign_key" in constraints:
                    parent_table, parent_column = constraints["foreign_key"].split(".")
                    if parent_table not in self.tables or value not in self.tables[parent_table]["records"]:
                        if implicit_transaction:
                            self.transaction_manager.rollback_transaction(transaction_id)
                        return f"Foreign Key violation: '{value}' not found in '{parent_table}.{parent_column}'"
                
                old_value = table["records"][key].get(field)
                self.indexer.update_index(table_name, field, key, old_value, value)
                # Update the field
                table["records"][key][field] = value
            else:
                if implicit_transaction:
                    self.transaction_manager.rollback_transaction(transaction_id)
                return f"Field '{field}' does not exist in table '{table_name}'."
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'update', table_name, key, updates)
        
        # Complete the implicit transaction
        if implicit_transaction:
            result = self.transaction_manager.commit_transaction(transaction_id)
            if "successfully" not in result:
                return result
                
        return "Updated successfully!"
    
    def delete_table(self, table_name, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        if table_name in self.tables:
            self.tables[table_name]["records"].clear()
            
            # Log the operation
            self.transaction_manager.log_operation(transaction_id, 'delete_table', table_name)
            
            # Complete the implicit transaction
            if implicit_transaction:
                result = self.transaction_manager.commit_transaction(transaction_id)
                if "successfully" not in result:
                    return result
                    
            return f"All records deleted from table '{table_name}'."
            
        if implicit_transaction:
            self.transaction_manager.rollback_transaction(transaction_id)
        return f"Table '{table_name}' does not exist!"
    def select_all(self, table_name, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        table_name = table_name.strip().lower()
        
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        records = self.tables[table_name]["records"]
        
        if not records:
            if implicit_transaction:
                self.transaction_manager.commit_transaction(transaction_id)
            return f"No records found in table '{table_name}'!"
        
        output = f"Records in '{table_name}':\n"
        for key, record in records.items():
            output += f"Key: {key}, " + ", ".join(f"{k}: {v}" for k, v in record.items()) + "\n"
        
        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'select_all', table_name)
        
        # Complete the implicit transaction
        if implicit_transaction:
            self.transaction_manager.commit_transaction(transaction_id)
            
        return output.strip()
    
    def select_columns(self, table_name, columns, key, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}:{key}. Try again later."
                
        if table_name not in self.tables:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not exist!"
        
        table = self.tables[table_name]
        
        # Check if 'records' exists in the table
        if 'records' not in table:
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Table '{table_name}' does not have any records!"
        
        # Find the record based on key
        if key in table['records']:
            row = table['records'][key]
            result = {col: row[col] for col in columns if col in row}
            
            # Log the operation
            self.transaction_manager.log_operation(transaction_id, 'select_columns', table_name, columns, key)
            
            # Complete the implicit transaction
            if implicit_transaction:
                self.transaction_manager.commit_transaction(transaction_id)
                
            return result
        
        if implicit_transaction:
            self.transaction_manager.rollback_transaction(transaction_id)
        return f"Record with id {key} not found in table '{table_name}'."

    def drop_table(self, table_name, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire write lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'write'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        if table_name in self.tables:
            del self.tables[table_name]
            
            # Log the operation
            self.transaction_manager.log_operation(transaction_id, 'drop_table', table_name)
            
            # Complete the implicit transaction
            if implicit_transaction:
                result = self.transaction_manager.commit_transaction(transaction_id)
                if "successfully" not in result:
                    return result
                    
            return f"Table '{table_name}' dropped successfully."
            
        if implicit_transaction:
            self.transaction_manager.rollback_transaction(transaction_id)
        return f"Table '{table_name}' does not exist!"

    def select_where(self, table_name, column, operator, value, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
                transaction_id = self._get_implicit_transaction_id()
                self.transaction_manager.begin_transaction(transaction_id)
                implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
                return f"Transaction {transaction_id} is not active!"

        table_name = table_name.strip().lower()
        column = column.strip().lower()

        if table_name not in self.tables:
                if implicit_transaction:
                        self.transaction_manager.rollback_transaction(transaction_id)
                return "Table does not exist!"

        table = self.tables[table_name]

        # Try to use index for faster lookup
        keys = self.indexer.get_keys_by_value(table_name, column.strip().lower(), value, operator)

        if keys is not None:
                # Index was available, use it
                matching_records = []
                for key in keys:
                        # Acquire read lock for each record
                        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'read'):
                                if implicit_transaction:
                                        self.transaction_manager.rollback_transaction(transaction_id)
                                return f"Could not acquire lock for {table_name}:{key}. Try again later."

                        if key in table["records"]:
                                matching_records.append(table["records"][key])
        else:
                # No index available, fall back to full table scan
                matching_records = []
                for key, row in table["records"].items():
                        # Acquire read lock for each record
                        if not self.transaction_manager.acquire_lock(transaction_id, table_name, key, 'read'):
                                if implicit_transaction:
                                        self.transaction_manager.rollback_transaction(transaction_id)
                                return f"Could not acquire lock for {table_name}:{key}. Try again later."

                        if column not in row:
                                continue

                        row_value = row[column]

                        if operator == "=":
                                if row_value == value:
                                        matching_records.append(row)
                        elif operator == ">":
                                if row_value > value:
                                        matching_records.append(row)
                        elif operator == "<":
                                if row_value < value:
                                        matching_records.append(row)
                        elif operator == ">=":
                                if row_value >= value:
                                        matching_records.append(row)
                        elif operator == "<=":
                                if row_value <= value:
                                        matching_records.append(row)
                        elif operator == "<>":
                                if row_value != value:
                                        matching_records.append(row)
                        else:
                                if implicit_transaction:
                                        self.transaction_manager.rollback_transaction(transaction_id)
                                return f"Unsupported operator: {operator}"

        # Log the operation
        self.transaction_manager.log_operation(transaction_id, 'select_where', table_name, column, operator, value)

        # Complete the implicit transaction
        if implicit_transaction:
                self.transaction_manager.commit_transaction(transaction_id)

        return matching_records

    def count_records(self, table_name, transaction_id=None):
        # Handle implicit transactions if needed
        implicit_transaction = False
        if transaction_id is None:
            transaction_id = self._get_implicit_transaction_id()
            self.transaction_manager.begin_transaction(transaction_id)
            implicit_transaction = True
        elif not self.transaction_manager.is_transaction_active(transaction_id):
            return f"Transaction {transaction_id} is not active!"
            
        # Acquire read lock on table
        if not self.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read'):
            if implicit_transaction:
                self.transaction_manager.rollback_transaction(transaction_id)
            return f"Could not acquire lock for {table_name}. Try again later."
                
        if table_name in self.tables:
            # Log the operation
            self.transaction_manager.log_operation(transaction_id, 'count_records', table_name)
            
            # Complete the implicit transaction
            if implicit_transaction:
                self.transaction_manager.commit_transaction(transaction_id)
                
            return f"Total records in '{table_name}': {len(self.tables[table_name]['records'])}"
            
        if implicit_transaction:
            self.transaction_manager.rollback_transaction(transaction_id)
        return f"Table '{table_name}' does not exist!"
    
    def create_index(self, table_name, column_name, transaction_id=None):
        """Create an index on the specified column of the table"""
        return self.indexer.create_index(table_name, column_name, transaction_id)
    
    def drop_index(self, table_name, column_name, transaction_id=None):
        """Drop an index from the specified column of the table"""
        return self.indexer.drop_index(table_name, column_name, transaction_id)
    
    def has_index(self, table_name, column_name):
        """Check if an index exists on the specified column of the table"""
        return (table_name in self.indexer.indexes and column_name in self.indexer.indexes[table_name])
    
    def get_all_indexes(self):
        """Get a list of all indexes in the database"""
        result = []
        for table_name, columns in self.indexer.indexes.items():
                for column_name in columns:
                        result.append(f"{table_name}.{column_name}")
        return result

    def _json_serializer(self, obj):
        """Custom JSON serializer to handle datetime objects"""
        if isinstance(obj, datetime):
                return obj.strftime("%Y-%m-%d %H:%M:%S")
        raise TypeError(f"Type {type(obj)} not serializable")

    def save_to_file(self):
        try:
            data_to_save = {
                "tables": self.tables,
                "indexes": self.indexer.indexes
            }

            with open(self.file_name, 'w') as file:
                json.dump(data_to_save, file, default=self._json_serializer)
            return True
        except Exception as e:
            print(f"Error saving to file: {str(e)}")
            return False

    def load_from_file(self):
        try:
            print(f"DEBUG: Attempting to load from {self.file_name}")
            with open(self.file_name, 'r') as file:
                data = json.load(file)

                # Handle both old and new format
                if isinstance(data, dict) and "tables" in data:
                        self.tables = data["tables"]
                        if hasattr(self, "indexer"):
                            if "indexes" in data:
                                self.indexer.indexes = data["indexes"]
                            else:
                                print("DEBUG: Indexer not initialized; skipping index load.")

                else:
                        # Old format - just tables
                        self.tables = data

                # Convert types for loaded data
                for table_name, table in self.tables.items():
                        for key, record in table.get("records", {}).items():
                            for col_name, value in record.items():
                                    col_type = table.get("columns", {}).get(col_name, {}).get("type")
                                    if col_type == "int":
                                        record[col_name] = int(value) if isinstance(value, str) and value.isdigit() else value
                                    elif col_type == "float":
                                        try:
                                                record[col_name] = float(value) if isinstance(value, str) else value
                                        except ValueError:
                                                pass
                                    elif col_type == "bool":
                                        if isinstance(value, str):
                                                record[col_name] = value.lower() == "true"
                                    elif col_type == "datetime" and isinstance(value, str):
                                        try:
                                                record[col_name] = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                                        except ValueError:
                                                pass

                print(f"DEBUG: Loaded tables: {list(self.tables.keys())}")

        except FileNotFoundError:
            print(f"DEBUG: File {self.file_name} not found, starting with empty database")
            self.tables = {}
        except json.JSONDecodeError as e:
            print(f"DEBUG: Error decoding JSON: {str(e)}")
            self.tables = {}
        except Exception as e:
            print(f"DEBUG: Unexpected error loading database: {str(e)}")
            self.tables = {}

    def ensure_indexer(self):
        """Ensure that the indexer is properly initialized and attached to this database instance"""
        if not hasattr(self, 'indexer') or self.indexer is None:
            from indexer import Indexer  # Import here to avoid circular imports
            self.indexer = Indexer(self)
            print(f"DEBUG: Created new Indexer instance: {id(self.indexer)}")
        else:
            print(f"DEBUG: Using existing Indexer instance: {id(self.indexer)}")
        return self.indexer
                    
class Indexer:
    def __init__(self, db):
        self.db = db
        self.indexes = {}  # Format: {table_name: {column_name: {value: [keys]}}}
        print(f"DEBUG: New Indexer instance created. ID: {id(self)}")

    def create_index(self, table_name, column_name, transaction_id=None):
        """Create an index on the specified column of the table"""
        print(f"DEBUG: Starting create_index for {table_name}.{column_name}")

        # Standardize input
        table_name = table_name.strip().lower()
        column_name = column_name.strip().lower()
        
        try:
            # Handle implicit transactions if needed
            implicit_transaction = False
            if transaction_id is None:
                print("DEBUG: Creating implicit transaction")
                # Corrected transaction_id handling
                raw_id = self.transaction_id_input.text().strip() if hasattr(self, 'transaction_id_input') else None
                transaction_id = raw_id if raw_id else None

                self.db.transaction_manager.begin_transaction(transaction_id)
                implicit_transaction = True
            elif not self.db.transaction_manager.is_transaction_active(transaction_id):
                print(f"DEBUG: Transaction {transaction_id} is not active")
                return f"Transaction {transaction_id} is not active!"
                
            # Acquire read lock on table
            lock_acquired = self.db.transaction_manager.acquire_lock(transaction_id, table_name, "schema", 'read')
            print(f"DEBUG: Lock acquisition result: {lock_acquired}")
            
            if not lock_acquired:
                print(f"DEBUG: Failed to acquire lock for {table_name}")
                if implicit_transaction:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                return f"Could not acquire lock for {table_name}. Try again later."
                    
            # Check if table exists
            if table_name not in self.db.tables:
                print(f"DEBUG: Table '{table_name}' not found in {list(self.db.tables.keys())}")
                if implicit_transaction:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                return f"Table '{table_name}' does not exist!"
                
            # Check if column exists
            if column_name not in self.db.tables[table_name]["columns"]:
                print(f"DEBUG: Column '{column_name}' not found in table columns: {list(self.db.tables[table_name]['columns'].keys())}")
                if implicit_transaction:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                return f"Column '{column_name}' does not exist in table '{table_name}'!"
                
            # Initialize index structure if it doesn't exist
            if table_name not in self.indexes:
                self.indexes[table_name] = {}
                print(f"DEBUG: Created table entry in indexes: {table_name}")
                
            if column_name in self.indexes[table_name]:
                print(f"DEBUG: Index already exists on '{table_name}.{column_name}'")
                if implicit_transaction:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                return f"Index on '{table_name}.{column_name}' already exists!"
                
            # Create the index
            self.indexes[table_name][column_name] = {}
            print(f"DEBUG: Index structure initialized for {table_name}.{column_name}")

            # Populate the index with existing data
            record_count = 0
            for key, record in self.db.tables[table_name]["records"].items():
                if column_name in record:
                    value = record[column_name]
                    if value not in self.indexes[table_name][column_name]:
                        self.indexes[table_name][column_name][value] = []
                    self.indexes[table_name][column_name][value].append(key)
                    record_count += 1
            
            print(f"DEBUG: Populated index with {record_count} records")
            print(f"DEBUG: Current indexes: {self.indexes}")

            # Log the operation
            self.db.transaction_manager.log_operation(transaction_id, 'create_index', table_name, column_name)
            
            # Complete the implicit transaction
            if implicit_transaction:
                commit_result = self.db.transaction_manager.commit_transaction(transaction_id)
                print(f"DEBUG: Transaction commit result: {commit_result}")
                
            print(f"DEBUG: Index creation completed successfully")
            return f"Index created on '{table_name}.{column_name}' successfully!"
            
        except Exception as e:
            import traceback
            error_msg = f"Exception in create_index: {str(e)}\n{traceback.format_exc()}"
            print(f"DEBUG: {error_msg}")
            
            # Rollback transaction if it was implicit
            if 'implicit_transaction' in locals() and implicit_transaction and 'transaction_id' in locals():
                try:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                    print(f"DEBUG: Rolled back transaction {transaction_id}")
                except Exception as rollback_error:
                    print(f"DEBUG: Error during rollback: {str(rollback_error)}")
                    
            return f"Error creating index: {str(e)}"
     
    def drop_index(self, table_name, column_name, transaction_id=None):
        """Drop an index from the specified column of the table"""
        print(f"DEBUG: Starting drop_index for {table_name}.{column_name}")
        
        # Standardize input
        table_name = table_name.strip().lower()
        column_name = column_name.strip().lower()
        
        try:
            # Handle implicit transactions if needed
            implicit_transaction = False
            if transaction_id is None:
                print("DEBUG: Creating implicit transaction for drop_index")
                transaction_id = self.db._get_implicit_transaction_id()
                self.db.transaction_manager.begin_transaction(transaction_id)
                implicit_transaction = True
            elif not self.db.transaction_manager.is_transaction_active(transaction_id):
                print(f"DEBUG: Transaction {transaction_id} is not active")
                return f"Transaction {transaction_id} is not active!"
                
            # Check if index exists
            if (table_name not in self.indexes or 
                column_name not in self.indexes[table_name]):
                print(f"DEBUG: Index on '{table_name}.{column_name}' does not exist")
                print(f"DEBUG: Current indexes: {self.indexes}")
                if implicit_transaction:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                return f"Index on '{table_name}.{column_name}' does not exist!"
                
            # Drop the index
            del self.indexes[table_name][column_name]
            print(f"DEBUG: Index removed for {table_name}.{column_name}")
            
            # If no more indexes for this table, remove the table entry
            if not self.indexes[table_name]:
                del self.indexes[table_name]
                print(f"DEBUG: Removed empty table entry for {table_name}")
                
            # Log the operation
            self.db.transaction_manager.log_operation(transaction_id, 'drop_index', table_name, column_name)
            
            # Complete the implicit transaction
            if implicit_transaction:
                commit_result = self.db.transaction_manager.commit_transaction(transaction_id)
                print(f"DEBUG: Transaction commit result for drop: {commit_result}")
                
            print(f"DEBUG: Index deletion completed successfully")
            return f"Index dropped from '{table_name}.{column_name}' successfully!"
            
        except Exception as e:
            import traceback
            error_msg = f"Exception in drop_index: {str(e)}\n{traceback.format_exc()}"
            print(f"DEBUG: {error_msg}")
            
            # Rollback transaction if it was implicit
            if 'implicit_transaction' in locals() and implicit_transaction and 'transaction_id' in locals():
                try:
                    self.db.transaction_manager.rollback_transaction(transaction_id)
                    print(f"DEBUG: Rolled back transaction {transaction_id}")
                except Exception as rollback_error:
                    print(f"DEBUG: Error during rollback: {str(rollback_error)}")
                    
            return f"Error dropping index: {str(e)}"
        
    def update_index(self, table_name, column_name, key, old_value, new_value):
        """Update an index when a record is updated"""
        if (table_name not in self.indexes or 
            column_name not in self.indexes[table_name]):
            return  # No index to update
            
        # Remove the old value
        if old_value in self.indexes[table_name][column_name]:
            if key in self.indexes[table_name][column_name][old_value]:
                self.indexes[table_name][column_name][old_value].remove(key)
                
            # Clean up empty lists
            if not self.indexes[table_name][column_name][old_value]:
                del self.indexes[table_name][column_name][old_value]
                
        # Add the new value
        if new_value not in self.indexes[table_name][column_name]:
            self.indexes[table_name][column_name][new_value] = []
        self.indexes[table_name][column_name][new_value].append(key)
        
    def delete_from_index(self, table_name, key, record):
        """Remove a record from all indexes when it's deleted"""
        if table_name not in self.indexes:
            return  # No indexes for this table
            
        for column_name, index in self.indexes[table_name].items():
            if column_name in record:
                value = record[column_name]
                if value in index and key in index[value]:
                    index[value].remove(key)
                    
                    # Clean up empty lists
                    if not index[value]:
                        del index[value]
                        
    def add_to_index(self, table_name, key, record):
        """Add a record to all indexes when it's inserted"""
        if table_name not in self.indexes:
            return  # No indexes for this table
            
        for column_name, index in self.indexes[table_name].items():
            if column_name in record:
                value = record[column_name]
                if value not in index:
                    index[value] = []
                index[value].append(key)
                
    def get_keys_by_value(self, table_name, column_name, value, operator="="):
        """Get all keys that match a value using the index"""
        if (table_name not in self.indexes or 
                column_name not in self.indexes[table_name]):
                return None  # No index available

        index = self.indexes[table_name][column_name]

        # Convert value to the appropriate type based on the column type
        if table_name in self.db.tables and column_name in self.db.tables[table_name]["columns"]:
                col_type = self.db.tables[table_name]["columns"][column_name]["type"]
                if col_type == "int" and isinstance(value, str):
                        try:
                                value = int(value)
                        except ValueError:
                                return []  # Invalid integer value
                elif col_type == "float" and isinstance(value, str):
                        try:
                                value = float(value)
                        except ValueError:
                                return []  # Invalid float value

        if operator == "=":
                return index.get(value, [])

        # For other operators, we need to scan the index
        result = []
        for idx_value, keys in index.items():
                # Ensure both values are of the same type for comparison
                if isinstance(idx_value, (int, float)) and isinstance(value, str):
                        try:
                                compare_value = type(idx_value)(value)
                        except ValueError:
                                continue  # Skip if conversion fails
                elif isinstance(idx_value, str) and isinstance(value, (int, float)):
                        try:
                                compare_value = value
                                idx_value = type(value)(idx_value)
                        except ValueError:
                                continue  # Skip if conversion fails
                else:
                        compare_value = value

                if operator == ">" and idx_value > compare_value:
                        result.extend(keys)
                elif operator == "<" and idx_value < compare_value:
                        result.extend(keys)
                elif operator == ">=" and idx_value >= compare_value:
                        result.extend(keys)
                elif operator == "<=" and idx_value <= compare_value:
                        result.extend(keys)
                elif operator == "<>" and idx_value != compare_value:
                        result.extend(keys)

        return result

# db =Database("custom_db.json")
# db.create_table("students", columns=["id int", "name string"], constraints={"id": ["primary_key"]})
# columns = db.get_table_columns("students")
# print(db.insert("students", 1, ['1', 'John']))  # Inserted successfully!
# print(db.insert("students", 2, ['2', 'Alice']))
# print(db.get("students", 1))
# print(db.update("students", 1, {"name": "Johnny"}))  
# print(db.group_by("students", "name", "id"))  
# db.create_table("grades", columns=["student_id int", "grade string"])
# db.insert("grades", 1, ["1", "A"])
# db.insert("grades", 2, ["2", "B"])
# print(db.inner_join("students", "grades", "id", "student_id", ["name", "grade"]))
# print(db.select_all("students"))
# print(db.select_columns("students", ["name"], "1"))
# print(db.select_where("students", "id", ">", 1))
# print(db.count_records("grades"))
# print(db.delete_table("grades"))
# print(db.select_all("grades"))

# db = Database("database.json")
# # Start an explicit transaction
# tx_id = "test_transaction"
# print("Starting transaction...")
# print(db.begin_transaction(tx_id))

# # Create a table
# print("Creating table...")
# result = db.create_table(
#        "students", 
#     ["id int", "name string", "age int"],
#     {"id": ["primary_key"]},
#     transaction_id=tx_id
# )
# print(result)

# # Commit the transaction
# print("Committing transaction...")
# print(db.commit_transaction(tx_id))

# print("Done!")

# # Or rollback if needed
# # db.rollback_transaction(tx_id)
# # Create tables with constraints
# db.create_table(
#     "students", 
#     ["id int", "name string", "age int", "class_id int"],
#     {"id": ["primary_key"], "class_id": ["foreign_key", "classes.id"]}
# )

# db.create_table(
#     "classes", 
#     ["id int", "name string", "capacity int"],
#     {"id": ["primary_key"]}
# )

# # Insert records
# db.insert("classes", "101", ["101", "Mathematics", "30"])
# db.insert("classes", "102", ["102", "Physics", "25"])
# db.insert("classes", "103", ["103", "Chemistry", "20"])

# db.insert("students", "1", ["1", "John Doe", "20", "101"])
# db.insert("students", "2", ["2", "Jane Smith", "21", "102"])
# db.insert("students", "3", ["3", "Bob Johnson", "19", "101"])
# db.insert("students", "4", ["4", "Alice Brown", "22", "103"])
# db.insert("students", "5", ["5", "Charlie Davis", "20", "102"])

# # Get a specific record
# student_1 = db.get("students", "1")
# print(student_1)  # Should print the record for John Doe

# # Update a record
# db.update("students", "1", {"age": "21", "name": "John Smith"})

# # Delete a record
# db.delete("students", "5")

# # Count records
# count = db.count_records("students")
# print(count)  # Should print: "Total records in 'students': 4"

# # Select all records
# all_students = db.select_all("students")
# print(all_students)

# # Select specific columns
# columns = db.select_columns("students", ["name", "age"], "1")
# print(columns)  # Should print: {'name': 'John Smith', 'age': 21}

# # Select with condition
# math_students = db.select_where("students", "class_id", "=", "101")
# print(math_students)  # Should print students in Mathematics class

# # Group by
# age_groups = db.group_by("students", "age", "name")
# print(age_groups)  # Should group students by age

# # Having clause
# popular_ages = db.having("students", "age", "name", ">", "1")
# print(popular_ages)  # Should show ages with more than 1 student

# # Distinct values
# distinct_ages = db.distinct("students", "age")
# print(distinct_ages)  # Should print unique age values

# # Join tables
# joined_data = db.inner_join("students", "classes", "class_id", "id", ["students.name", "classes.name"])
# print(joined_data)  # Should join students with their classes

# # Drop a column
# db.drop_column("students", "age")

# # Delete all records from a table
# db.delete_table("students")

# # Drop a table completely
# db.drop_table("classes")
# print("all are working")

# print("Creating test table...")
# result = db.create_table("students", ["id int", "name string", "age int", "grade float"], 
# {"id": ["primary_key"]})
# print(result)

# # Insert test data
# print("\nInserting test data...")
# db.insert("students", "1", ["1", "John", "20", "3.5"])
# db.insert("students", "2", ["2", "Alice", "22", "3.8"])
# db.insert("students", "3", ["3", "Bob", "21", "3.2"])
# db.insert("students", "4", ["4", "Carol", "23", "3.9"])
# db.insert("students", "5", ["5", "David", "20", "3.7"])

# # Test query without index
# print("\nTesting query without index...")
# start_time = datetime.now()
# result = db.select_where("students", "age", "=", "20")
# end_time = datetime.now()
# print(f"Query result: {result}")
# print(f"Query time without index: {(end_time - start_time).total_seconds()} seconds")

# # Create an index on the age column
# print("\nCreating index on age column...")
# result = db.create_index("students", "age")
# print(result)

# # Test query with index
# print("\nTesting query with index...")
# start_time = datetime.now()
# result = db.select_where("students", "age", "=", "20")
# end_time = datetime.now()
# print(f"Query result: {result}")
# print(f"Query time with index: {(end_time - start_time).total_seconds()} seconds")

# # Test range query with index
# print("\nTesting range query with index...")
# result = db.select_where("students", "age", ">", "20")
# print(f"Students with age > 20: {result}")

# # Create another index on grade
# print("\nCreating index on grade column...")
# result = db.create_index("students", "grade")
# print(result)

# # Test query with the new index
# print("\nTesting query with grade index...")
# result = db.select_where("students", "grade", ">=", "3.5")
# print(f"Students with grade >= 3.5: {result}")

# # List all indexes
# print("\nListing all indexes...")
# print(db.get_all_indexes())

# # Drop an index
# print("\nDropping index on age column...")
# result = db.drop_index("students", "age")
# print(result)

# # Verify index was dropped
# print("\nVerifying index was dropped...")
# print(db.get_all_indexes())

# # Test update with index
# print("\nTesting update with index...")
# db.update("students", "1", {"grade": "4.0"})
# result = db.select_where("students", "grade", "=", "4.0")
# print(f"Students with grade = 4.0 after update: {result}")

# # Test delete with index
# print("\nTesting delete with index...")
# db.delete("students", "5")
# result = db.select_where("students", "grade", "=", "3.7")
# print(f"Students with grade = 3.7 after delete: {result}")

# print("\nIndexer test completed successfully!")