import sys
import re
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLineEdit, QPushButton, QTextEdit, QLabel, QTabWidget, QComboBox, QFormLayout, QGroupBox
from PyQt5.QtCore import Qt
from oldengine import Database
import json
from PyQt5.QtGui import QIcon

class StorageSQLUI(QWidget):
    def __init__(self):
        super().__init__()
        self.engine = Database()
        self.current_transaction_id = None
        self.init_ui()

    def init_ui(self):
                # Apply stylesheet for coloring and styling
        self.setStyleSheet("""
            QWidget {
                font-family: "Segoe UI", Arial;
                font-size: 18px;
                color: #333;
            }

            QTabWidget::pane {
                border: none;
                background-color: #f4f6f8;
            }

            QTabBar::tab {
                background: #e0e7ef;
                padding: 10px 24px;
                margin: 2px;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            QTabBar::tab:selected {
                background: #4f81c7;
                color: white;
                font-weight: bold;
            }

            QPushButton {
                background-color: #4f81c7;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 18px;
            }

            QPushButton:hover {
                background-color: #3b6aa0;
            }

            QLineEdit, QTextEdit {
                background-color: white;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 6px;
            }

            QGroupBox {
                border: none;
                font-weight: 600;
                margin-top: 20px;
                background: #ffffff;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0px 4px 10px rgba(0,0,0,0.05);
            }

            QGroupBox::title {
                font-size: 10px;
                font-weight: 600;
                subcontrol-origin: margin;
                subcontrol-position: top left;
                margin-top: 8px;
                padding: 0 10px;
                color: #4f81c7;
            }

            QLabel {
                font-weight: 500;
            }

            QLabel#status_bar {
                padding: 10px;
                background-color: #f0f2f5;
                border-top: 1px solid #ccc;
                font-size: 10px;
            }
        """)


        # self.status_bar.setObjectName("status_bar")

        self.setWindowTitle("Advanced Database Management System")
        self.showFullScreen()
        # self.setGeometry(100, 100, 800, 600)
        
        # Create tab widget
        self.tabs = QTabWidget()
        
        # Create tabs
        self.query_tab = QWidget()
        self.transaction_tab = QWidget()
        self.join_tab = QWidget()
        self.indexer_tab = QWidget()
        
        # Add tabs to widget
        self.tabs.addTab(self.query_tab, QIcon("icons/query.png"), "SQL Queries")
        self.tabs.addTab(self.transaction_tab, QIcon("icons/transaction.png"), "Transaction Management")
        self.tabs.addTab(self.join_tab, QIcon("icons/join.png"), "Join Operations")
        self.tabs.addTab(self.indexer_tab, QIcon("icons/index.png"), "Indexer")
                
        # Set up each tab
        self.setup_query_tab()
        self.setup_transaction_tab()
        self.setup_join_tab()
        self.setup_indexer_tab()
        self.refresh_table_overview()
        
        # Main layout
        main_layout = QVBoxLayout()
        main_layout.addWidget(self.tabs)
        
        # Status bar
        self.status_bar = QLabel("Ready ")
        main_layout.addWidget(self.status_bar)
        
        self.setLayout(main_layout)
        
    # ... existing code ...
    def setup_indexer_tab(self):
        layout = QVBoxLayout()
        
        # Form for creating an index
        create_form_layout = QFormLayout()
        
        # Table selection for creating index
        self.index_table_input = QLineEdit()
        create_form_layout.addRow("Table Name:", self.index_table_input)
        
        # Column selection for creating index
        self.index_column_input = QLineEdit()
        create_form_layout.addRow("Column Name:", self.index_column_input)
        
        # Add form to layout
        create_index_form = QGroupBox("Create Index")
        create_index_form.setLayout(create_form_layout)
        layout.addWidget(create_index_form)
        
        # Create index button
        self.create_index_btn = QPushButton("Create Index")
        self.create_index_btn.clicked.connect(self.create_index)
        layout.addWidget(self.create_index_btn)
        
        # Form for dropping an index
        drop_form_layout = QFormLayout()
        
        # Table selection for dropping index
        self.drop_index_table_input = QLineEdit()
        drop_form_layout.addRow("Table Name:", self.drop_index_table_input)
        
        # Column selection for dropping index
        self.drop_index_column_input = QLineEdit()
        drop_form_layout.addRow("Column Name:", self.drop_index_column_input)
        
        # Add form to layout
        drop_index_form = QGroupBox("Drop Index")
        drop_index_form.setLayout(drop_form_layout)
        layout.addWidget(drop_index_form)
        
        # Drop index button
        self.drop_index_btn = QPushButton("Drop Index")
        self.drop_index_btn.clicked.connect(self.drop_index)
        layout.addWidget(self.drop_index_btn)
        
        # Button to refresh index list
        self.refresh_indexes_btn = QPushButton("Refresh Index List")
        self.refresh_indexes_btn.clicked.connect(self.refresh_indexes)
        layout.addWidget(self.refresh_indexes_btn)
        
        # Index output
        self.index_output = QTextEdit()
        self.index_output.setReadOnly(True)
        layout.addWidget(self.index_output)
        
        self.indexer_tab.setLayout(layout)
        
        # Initialize with current indexes
        self.refresh_indexes()

    def setup_query_tab(self):
        layout = QVBoxLayout()

        # Query input
        self.query_input = QLineEdit(self)
        self.query_input.setPlaceholderText("Enter your SQL-like query here...")
        layout.addWidget(self.query_input)

        # Execute button
        self.execute_btn = QPushButton("Execute Query", self)
        self.execute_btn.clicked.connect(self.execute_query)
        layout.addWidget(self.execute_btn)

        # Output display
        self.output = QTextEdit(self)
        self.output.setReadOnly(True)
        layout.addWidget(self.output)

        # Create group box
        self.table_info_group = QGroupBox("📋 Table Info")

        # Create layout for group box
        self.table_info_layout = QVBoxLayout()

        # Create the text area to show table info
        self.table_info_output = QTextEdit()
        self.table_info_output.setReadOnly(True)

        # Add the text area to the layout
        self.table_info_layout.addWidget(self.table_info_output)

        # Set the layout to the group box
        self.table_info_group.setLayout(self.table_info_layout)

        # Finally, add the group box to your tab's main layout
        layout.addWidget(self.table_info_group)

        # Help section
        help_box = QGroupBox("Query Examples")
        help_layout = QVBoxLayout()
        help_text = QTextEdit()
        help_text.setReadOnly(True)
        help_text.setHtml("""
        <ul style="padding-left:20px; font-size:14px;">
            <li><span style="font-weight:bold;">CREATE TABLE:</span> CREATE TABLE students (id INT, name TEXT, age INT) CONSTRAINTS (id PRIMARY_KEY)</li>
            <li><span style="font-weight:bold;">INSERT:</span> INSERT INTO students VALUES (1, 'Alice', 21)</li>
            <li><span style="font-weight:bold;">SELECT:</span> SELECT * FROM students WHERE id = 1</li>
            <li><span style="font-weight:bold;">UPDATE:</span> UPDATE students SET name = 'Bob' WHERE id = 1</li>
            <li><span style="font-weight:bold;">DELETE:</span> DELETE FROM students WHERE id = 1</li>
            <li><span style="font-weight:bold;">DROP TABLE:</span> DROP TABLE students</li>
            <li><span style="font-weight:bold;">GROUP BY:</span> SELECT age, COUNT(*) FROM students GROUP BY age</li>
            <li><span style="font-weight:bold;">HAVING:</span> SELECT age, COUNT(*) FROM students GROUP BY age HAVING COUNT(*) > 1</li>
            <li><span style="font-weight:bold;">DISTINCT:</span> SELECT DISTINCT age FROM students</li>
            <li><span style="font-weight:bold;">JOIN:</span> SELECT s.name, c.course FROM students s JOIN courses c ON s.id = c.student_id</li>
        </ul>
        """)
        help_layout.addWidget(help_text)
        help_box.setLayout(help_layout)
        layout.addWidget(help_box)

        self.query_tab.setLayout(layout)

    def setup_transaction_tab(self):
        layout = QVBoxLayout()
        
        # Transaction controls
        transaction_controls = QHBoxLayout()
        
        # Transaction ID input
        self.transaction_id_input = QLineEdit()
        self.transaction_id_input.setPlaceholderText("Transaction ID (optional)")
        transaction_controls.addWidget(self.transaction_id_input)
        
        # Begin transaction button
        self.begin_btn = QPushButton("Begin Transaction")
        self.begin_btn.clicked.connect(self.begin_transaction)
        transaction_controls.addWidget(self.begin_btn)
        
        # Commit transaction button
        self.commit_btn = QPushButton("Commit Transaction")
        self.commit_btn.clicked.connect(self.commit_transaction)
        transaction_controls.addWidget(self.commit_btn)
        
        # Rollback transaction button
        self.rollback_btn = QPushButton("Rollback Transaction")
        self.rollback_btn.clicked.connect(self.rollback_transaction)
        transaction_controls.addWidget(self.rollback_btn)
        
        layout.addLayout(transaction_controls)
        
        # Transaction status
        self.transaction_status = QLabel("No active transaction")
        layout.addWidget(self.transaction_status)
        
        # Transaction query input
        self.transaction_query_input = QLineEdit()
        self.transaction_query_input.setPlaceholderText("Enter query to execute within transaction...")
        layout.addWidget(self.transaction_query_input)
        
        # Execute in transaction button
        self.execute_in_transaction_btn = QPushButton("Execute in Transaction")
        self.execute_in_transaction_btn.clicked.connect(self.execute_in_transaction)
        layout.addWidget(self.execute_in_transaction_btn)
        
        # Transaction output
        self.transaction_output = QTextEdit()
        self.transaction_output.setReadOnly(True)
        layout.addWidget(self.transaction_output)
        
        self.transaction_tab.setLayout(layout)

    def setup_join_tab(self):
        layout = QVBoxLayout()
        
        # Form for join operation
        form_layout = QFormLayout()
        
        # First table selection
        self.table1_input = QLineEdit()
        form_layout.addRow("First Table:", self.table1_input)
        
        # Second table selection
        self.table2_input = QLineEdit()
        form_layout.addRow("Second Table:", self.table2_input)
        
        # Join columns
        self.join_column1_input = QLineEdit()
        form_layout.addRow("First Table Join Column:", self.join_column1_input)
        
        self.join_column2_input = QLineEdit()
        form_layout.addRow("Second Table Join Column:", self.join_column2_input)
        
        # Columns to select
        self.join_columns_input = QLineEdit()
        self.join_columns_input.setPlaceholderText("comma-separated list of columns")
        form_layout.addRow("Columns to Select:", self.join_columns_input)
        
        # Add form to layout
        join_form = QGroupBox("Inner Join Configuration")
        join_form.setLayout(form_layout)
        layout.addWidget(join_form)
        
        self.execute_join_btn = QPushButton("Execute Join")
        self.execute_join_btn.clicked.connect(self.execute_join)
        layout.addWidget(self.execute_join_btn)
        
        # Join output
        self.join_output = QTextEdit()
        self.join_output.setReadOnly(True)
        layout.addWidget(self.join_output)
        
        self.join_tab.setLayout(layout)

    def load_tables_from_file(self):
        try:
            with open("database.json", "r") as f:
                data = json.load(f)
                return data.get("tables", {})  # Assuming the structure is {'tables': { ... }}
        except Exception as e:
            print(f"Error loading database.json: {e}")
            return {}

    def refresh_table_overview(self):
        tables = self.load_tables_from_file()  # If you're not already using self.engine.tables

        if not tables:
            self.table_info_output.setText("No tables found in database.json.")
            return

        overview = ""
        for table_name, table_data in tables.items():
            columns = table_data.get("columns", {})
            records = table_data.get("records", {})
            overview += f"<p>📂 <b>Table:</b> {table_name}<br>"
            overview += f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Columns:</b>"
            for col_name, col_info in columns.items():
                col_type = col_info.get("type", "unknown")
                overview += f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- {col_name} (<i>{col_type}</i>) &ensp;"
            overview += f"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Total Entries:</b> {len(records)}</p>"

        self.table_info_output.setHtml(overview.strip())

    def execute_query(self):
        query = self.query_input.text().strip()
        import time
        start_time = time.time()
    
        result = self.parse_and_execute_query(query)
    
    # Calculate execution time
        execution_time = time.time() - start_time
    
    # Display result with timing information
        self.output.setText(f"Query result:\n{str(result)}\n\nExecution time: {execution_time:.6f} seconds")

    def parse_and_execute_query(self, query, transaction_id=None):
        result = "Invalid query syntax!"

        create_match = re.match(r"^CREATE TABLE (\w+) \((.+)\) CONSTRAINTS \((.+)\)$", query, re.IGNORECASE)
        insert_match = re.match(r"^INSERT INTO (\w+) VALUES \((.+)\)$", query, re.IGNORECASE)
        delete_match = re.match(r"^DELETE FROM (\w+) WHERE id=(\d+)$", query, re.IGNORECASE)
        update_match = re.match(r"^UPDATE (\w+) SET (.+) WHERE id=(\d+)$", query, re.IGNORECASE)
        select_match = re.match(r"^SELECT \* FROM (\w+) WHERE id=(\d+)$", query, re.IGNORECASE)
        delete_table_match = re.match(r"^DELETE TABLE (\w+)$", query, re.IGNORECASE)
        select_all_match = re.match(r"^SELECT \* FROM (\w+)$", query, re.IGNORECASE)
        drop_table_match = re.match(r"^DROP TABLE (\w+)$", query, re.IGNORECASE)
        count_match = re.match(r"^COUNT (\w+)$", query, re.IGNORECASE)
        select_columns_match = re.match(r"^SELECT (.+) FROM (\w+) WHERE id=(\d+)$", query, re.IGNORECASE)
        select_where_match = re.match(r"^SELECT \* FROM (\w+) WHERE (\w+)\s*(=|>|<|>=|<=|<>)\s*(\d+|\"[^\"]*\")$", query, re.IGNORECASE)
        group_by_match = re.match(r"^SELECT (\w+), COUNT\(\*\) FROM (\w+) GROUP BY (\w+)$", query, re.IGNORECASE)
        having_match = re.match(r"^SELECT (\w+), COUNT\(\*\) FROM (\w+) GROUP BY (\w+) HAVING COUNT\(\*\)\s*(=|>|<|>=|<=|<>)\s*(\d+)$", query, re.IGNORECASE)
        distinct_match = re.match(r"^SELECT DISTINCT (\w+) FROM (\w+)$", query, re.IGNORECASE)
        alter_drop_column_match = re.match(r"^ALTER TABLE (\w+) DROP COLUMN (\w+)$", query, re.IGNORECASE)

        if create_match:
                table_name, columns, constraints = create_match.groups()
                columns_list = [col.strip() for col in columns.split(",")]
                constraints_dict = {}
                for constraint in constraints.split(","):
                        parts = constraint.strip().split()
                        if len(parts) == 2:
                                constraints_dict[parts[0]] = [parts[1]]
                result = self.engine.create_table(table_name, columns_list, constraints_dict, transaction_id)

        elif insert_match:
                table_name, values = insert_match.groups()
                table_columns = self.engine.get_table_columns(table_name, transaction_id)
                if table_columns is None:
                        result = f"Table '{table_name}' does not exist!"
                else:
                        values_list = re.findall(r'"([^"]*)"|\'([^\']*)\'|([^,]+)', values)
                        values_list = [v[0] or v[1] or v[2].strip() for v in values_list]
                        if len(values_list) != len(table_columns):
                                result = f"Column-value mismatch! Expected {len(table_columns)} values but got {len(values_list)}."
                        else:
                                key = values_list[0]
                                result = self.engine.insert(table_name, key, values_list, transaction_id)

        elif delete_match:
                table_name, key = delete_match.groups()
                result = self.engine.delete(table_name, key, transaction_id)

        elif update_match:
                table_name, updates, key = update_match.groups()
                update_dict = {}
                for match in re.finditer(r"(\w+)\s*=\s*(\"[^\"]*\"|'[^']*'|\d+|true|false)", updates, re.IGNORECASE):
                        column, value = match.groups()
                        value = value.strip()
                        if value.startswith(("\"", "'")) and value.endswith(("\"", "'")):
                                update_dict[column.strip()] = value[1:-1]
                        elif value.isdigit():
                                update_dict[column.strip()] = int(value)
                        elif value.lower() in {"true", "false"}:
                                update_dict[column.strip()] = value.lower() == "true"
                result = self.engine.update(table_name, key, update_dict, transaction_id)

        elif select_match:
                table_name, key = select_match.groups()
                data = self.engine.get(table_name, key, transaction_id)
                result = "\n".join(f"{k}: {v}" for k, v in data.items()) if isinstance(data, dict) else data

        elif select_columns_match:
                columns, table_name, key = select_columns_match.groups()
                columns_list = columns.split(",")
                data = self.engine.select_columns(table_name, columns_list, key, transaction_id)
                result = "\n".join(f"{k}: {v}" for k, v in data.items()) if isinstance(data, dict) else data

        elif select_where_match:
                table_name, column, operator, value = select_where_match.groups()
                if value.isdigit():
                        value = int(value)
                elif value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                result = self.engine.select_where(table_name, column, operator, value, transaction_id)

        elif select_all_match:
                table_name = select_all_match.group(1)
                result = self.engine.select_all(table_name, transaction_id)

        elif delete_table_match:
                table_name = delete_table_match.group(1)
                result = self.engine.delete_table(table_name, transaction_id)

        elif drop_table_match:
                table_name = drop_table_match.group(1)
                result = self.engine.drop_table(table_name, transaction_id)

        elif count_match:
                table_name = count_match.group(1)
                result = self.engine.count_records(table_name, transaction_id)

        elif group_by_match:
                column, table_name, group_column = group_by_match.groups()
                result = self.engine.group_by(table_name, group_column, column, transaction_id)

        elif having_match:
                column, table_name, group_column, operator, value = having_match.groups()
                result = self.engine.having(table_name, group_column, column, operator, value, transaction_id)

        elif distinct_match:
                column, table_name = distinct_match.groups()
                result = self.engine.distinct(table_name, column, transaction_id)

        elif alter_drop_column_match:
                table_name, column_name = alter_drop_column_match.groups()
                result = self.engine.drop_column(table_name, column_name, transaction_id)
        
        return result
    
    def create_index(self):
        """UI method to create an index"""
        table_name = self.index_table_input.text().strip()
        column_name = self.index_column_input.text().strip()
        print(f"DEBUG: UI create_index called for {table_name}.{column_name}")

        if not table_name or not column_name:
            self.index_output.setText("Error: Table name and column name are required!")
            return
            
        # Get transaction ID if available
        transaction_id = self.transaction_id_input.text().strip() or None
        
        try:
            # Ensure indexer exists and is properly attached
            if not hasattr(self.engine, 'indexer') or self.engine.indexer is None:
                print("DEBUG: Indexer not found, creating new instance")
                self.engine.ensure_indexer()
                
            # Print status before operation
            print(f"DEBUG: Before create_index - Indexer: {id(self.engine.indexer)}")
            print(f"DEBUG: Before create_index - Current indexes: {self.engine.indexer.indexes}")
            
            # Create the index
            result = self.engine.indexer.create_index(table_name, column_name, transaction_id)
            self.index_output.setText(result)
            
            # Print status after operation
            print(f"DEBUG: After create_index - Result: {result}")
            print(f"DEBUG: After create_index - Current indexes: {self.engine.indexer.indexes}")
            
            # Refresh the index list
            self.refresh_indexes()
            
        except Exception as e:
            import traceback
            error_text = f"Error creating index: {str(e)}\n\n{traceback.format_exc()}"
            print(f"DEBUG: {error_text}")
            self.index_output.setText(error_text)

    def refresh_indexes(self):
        """UI method to refresh the index display"""
        try:
            # Ensure indexer exists
            if not hasattr(self.engine, 'indexer') or self.engine.indexer is None:
                print("DEBUG: Indexer not found during refresh, creating new instance")
                self.engine.ensure_indexer()
                
            print(f"DEBUG: Refresh_indexes - Current indexer: {id(self.engine.indexer)}")
            print(f"DEBUG: Refresh_indexes - Current indexes: {self.engine.indexer.indexes}")
            
            # Get all indexes directly from the indexer
            indexes = self.engine.indexer.indexes
            
            # Format the output
            if not indexes:
                self.index_output.setText("⚠️ No indexes found in the database.")
                return
            
            output_html = "<p style='padding-left:20px; font-size:20px;'><b>CURRENT INDEXES:</b></p>"

            for table_name, columns in indexes.items():
                for column_name in columns:
                    output_html += f"<p>&nbsp;&nbsp;- &nbsp; <b>{table_name}</b>.<b>{column_name}</b>"
                    index_size = sum(len(keys) for keys in columns[column_name].values())
                    unique_values = len(columns[column_name])
                    output_html += f"&nbsp;&nbsp;&nbsp;&nbsp;(<b>{index_size}</b> entries across <b>{unique_values}</b> unique values)</p>"

            # Add debug information
            output_html += "<p style='padding-left:20px; font-size:20px;'><br><b> DEBUG INFORMATION: </b></p>"
            debug_lines = [
                f"Indexer instance ID: {id(self.engine.indexer)}",
                f"Available tables: {list(self.engine.tables.keys())}",
                f"Index structure: {self.engine.indexer.indexes}"
            ]

            for line in debug_lines:
                if ":" in line:
                    key, value = line.split(":", 1)
                    output_html += f"<p><b>{key.strip()}:</b> &ensp;{value.strip()}</p>"
                else:
                    output_html += f"<p>{line}</p>"

            self.index_output.setHtml(output_html)

        except Exception as e:
            import traceback
            error_text = f"Error refreshing indexes: {str(e)}\n\n{traceback.format_exc()}"
            print(f"DEBUG: {error_text}")
            self.index_output.setText(error_text)
  
    def drop_index(self):
        table_name = self.drop_index_table_input.text().strip()
        column_name = self.drop_index_column_input.text().strip()
        
        if not table_name or not column_name:
            self.index_output.setText("Error: Table name and column name are required!")
            return
            
        # Get transaction ID if available
        transaction_id = self.transaction_id_input.text().strip() or None
        
        try:
            # Drop the index
            result = self.engine.indexer.drop_index(table_name, column_name, transaction_id)
            self.index_output.setText(result)
            
            # Refresh the index list
            self.refresh_indexes()
            
        except Exception as e:
            import traceback
            error_text = f"Error dropping index: {str(e)}\n\n{traceback.format_exc()}"
            print(error_text)  # Print to console for debugging
            self.index_output.setText(error_text)
                    
    def begin_transaction(self):
        transaction_id = self.transaction_id_input.text().strip()
        if not transaction_id:
            transaction_id = f"tx_{hash(datetime.now())}"
            self.transaction_id_input.setText(transaction_id)
        
        result = self.engine.begin_transaction(transaction_id)
        self.transaction_output.setText(result)
        
        if "successfully" in result:
            self.current_transaction_id = transaction_id
            self.transaction_status.setText(f"Active transaction: {transaction_id}")
            self.status_bar.setText(f"Transaction {transaction_id} started")
        else:
            self.status_bar.setText("Failed to start transaction")

    def commit_transaction(self):
        if not self.current_transaction_id:
            self.transaction_output.setText("No active transaction to commit")
            return
            
        result = self.engine.commit_transaction(self.current_transaction_id)
        self.transaction_output.setText(result)
        
        if "successfully" in result:
            self.current_transaction_id = None
            self.transaction_status.setText("No active transaction")
            self.status_bar.setText("Transaction committed successfully")
        else:
            self.status_bar.setText("Failed to commit transaction")

    def rollback_transaction(self):
        if not self.current_transaction_id:
            self.transaction_output.setText("No active transaction to rollback")
            return
            
        result = self.engine.rollback_transaction(self.current_transaction_id)
        self.transaction_output.setText(result)
        
        if "successfully" in result:
            self.current_transaction_id = None
            self.transaction_status.setText("No active transaction")
            self.status_bar.setText("Transaction rolled back successfully")
        else:
            self.status_bar.setText("Failed to rollback transaction")

    def execute_in_transaction(self):
        if not self.current_transaction_id:
            self.transaction_output.setText("No active transaction. Begin a transaction first.")
            return
            
        query = self.transaction_query_input.text().strip()
        if not query:
            self.transaction_output.setText("Please enter a query to execute")
            return
            
        result = self.parse_and_execute_query(query, self.current_transaction_id)
        self.transaction_output.setText(str(result))
        self.status_bar.setText(f"Query executed in transaction {self.current_transaction_id}")

    def execute_join(self):
        # Get join parameters
        table1 = self.table1_input.text().strip()
        table2 = self.table2_input.text().strip()
        join_column1 = self.join_column1_input.text().strip()
        join_column2 = self.join_column2_input.text().strip()
        columns_text = self.join_columns_input.text().strip()
        
        # Validate inputs
        if not all([table1, table2, join_column1, join_column2, columns_text]):
            self.join_output.setText("All fields are required")
            return
            
        # Parse columns
        columns = [col.strip() for col in columns_text.split(',')]
        
        # Execute join
        result = self.engine.inner_join(table1, table2, join_column1, join_column2, columns)
        
        # Format and display result
        if isinstance(result, list):
            if not result:
                output_text = "Join operation returned no results"
            else:
                # Create a formatted table-like output
                output_text = "Join Results:\n\n"
                # Get all column names from the first result
                all_columns = list(result[0].keys())
                
                # Create header
                header = " | ".join(all_columns)
                separator = "-" * len(header)
                output_text += f"{header}\n{separator}\n"
                
                # Add rows
                for row in result:
                    row_values = [str(row.get(col, "")) for col in all_columns]
                    output_text += " | ".join(row_values) + "\n"
        else:
            output_text = str(result)
            
        self.join_output.setText(output_text)
        self.status_bar.setText("Join operation executed")

def main():
    app = QApplication(sys.argv)
    ex = StorageSQLUI()
    ex.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    from datetime import datetime
    main()