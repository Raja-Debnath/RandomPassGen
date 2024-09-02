import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const PasswordGeneratorApp());
}

class PasswordGeneratorApp extends StatelessWidget {
  const PasswordGeneratorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Password Generator',
      theme: ThemeData(
        primarySwatch: Colors.purple,
        brightness: Brightness.light,
        scaffoldBackgroundColor: Colors.white,
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.black),
          bodyMedium: TextStyle(color: Colors.black),
        ),
      ),
      home: const PasswordGeneratorScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class PasswordGeneratorScreen extends StatefulWidget {
  const PasswordGeneratorScreen({super.key});

  @override
  _PasswordGeneratorScreenState createState() =>
      _PasswordGeneratorScreenState();
}

class _PasswordGeneratorScreenState extends State<PasswordGeneratorScreen> {
  bool _includeAlphabets = true;
  bool _includeNumbers = true;
  bool _includeSymbols = true;
  int _passwordLength = 12;
  String _generatedPassword = '';
  String _passwordStrength = 'Weak (0 bits)';
  List<String> _passwordHistory = [];
  String _hints = '';

  final String numbers = '0123456789';
  final String alphabets =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  final String symbols = '!@#\$%^&*()_+-=[]{}|;:,.<>?/';

  final TextEditingController _lengthController =
  TextEditingController(text: '12');
  final TextEditingController _hintsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPasswordHistory();
  }

  @override
  void dispose() {
    _lengthController.dispose();
    _hintsController.dispose();
    super.dispose();
  }

  String generatePasswordWithHints() {
    final pools = <String>[];
    if (_includeAlphabets) pools.add(alphabets);
    if (_includeNumbers) pools.add(numbers);
    if (_includeSymbols) pools.add(symbols);

    if (pools.isEmpty) {
      throw Exception('At least 1 character type must be enabled');
    }

    final hintsList = _hints.split(',').map((hint) => hint.trim()).toList();
    final password = <String>[];
    final random = Random();

    // Generate positions for hints
    final hintCount = hintsList.length;
    final hintIndices = List.generate(hintCount, (index) => index);
    hintIndices.shuffle(random);

    final hintPositions = <int>[];
    for (int i = 0; i < hintCount; i++) {
      hintPositions.add(random.nextInt(_passwordLength));
    }
    hintPositions.sort();

    for (int i = 0; i < _passwordLength; i++) {
      if (hintPositions.isNotEmpty && hintPositions.first == i) {
        // Place hint in the current position
        password.add(hintsList.removeAt(0));
        hintPositions.removeAt(0);
      } else {
        String pool = pools[random.nextInt(pools.length)];
        String character = pool[random.nextInt(pool.length)];
        password.add(character);
      }
    }

    return password.join('');
  }

  void updatePasswordStrength(String password) {
    int entropy = calculateEntropy(password);
    String strength = getStrength(entropy);

    setState(() {
      _passwordStrength =
      'Strength: $strength (${entropy.toStringAsFixed(2)} bits)';
    });
  }

  int calculateEntropy(String password) {
    int characterSetSize = 0;
    if (RegExp(r'[A-Z]').hasMatch(password))
      characterSetSize += 26; // Uppercase letters
    if (RegExp(r'[a-z]').hasMatch(password))
      characterSetSize += 26; // Lowercase letters
    if (RegExp(r'[0-9]').hasMatch(password)) characterSetSize += 10; // Numbers
    if (RegExp(r'[!@#\$%^&*()_+\-=\[\]{}|;:,.<>?/]').hasMatch(password))
      characterSetSize += 32; // Symbols

    if (characterSetSize == 0) return 0;

    return (password.length * log2(characterSetSize.toDouble())).toInt();
  }

  String getStrength(int entropy) {
    if (entropy >= 80) return 'Strong';
    if (entropy >= 40) return 'Medium';
    return 'Weak';
  }

  void _savePasswordHistory() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setStringList('passwordHistory', _passwordHistory);
  }

  void _loadPasswordHistory() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _passwordHistory = prefs.getStringList('passwordHistory') ?? [];
    });
  }

  void _clearHistory() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('passwordHistory');
    setState(() {
      _passwordHistory.clear();
    });
  }

  void addToHistory(String password) {
    if (!_passwordHistory.contains(password)) {
      setState(() {
        _passwordHistory.insert(0, password); // Add the latest password on top
      });
      _savePasswordHistory();
    }
  }

  void showHistoryDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('History'),
          content: SizedBox(
            width: double.maxFinite,
            height: 400, // Increased height
            child: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: _passwordHistory.length,
                    itemBuilder: (context, index) {
                      return Card(
                        color: Colors.purple[50],
                        child: ListTile(
                          title:
                          Text('${index + 1}. ${_passwordHistory[index]}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.copy),
                            onPressed: () {
                              Clipboard.setData(
                                  ClipboardData(text: _passwordHistory[index]));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content:
                                  Text('Password is copied to clipboard!'),
                                ),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () {
                        _clearHistory();
                        Navigator.of(context)
                            .pop(); // Close dialog after clearing
                      },
                      child: const Text('Clear All'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  title: const Text('About Us'),
                  onTap: () {
                    Navigator.of(context).pop();
                    _showAboutUsDialog();
                  },
                ),
                ListTile(
                  title: const Text('Password Tips'),
                  onTap: () {
                    Navigator.of(context).pop();
                    _showTipsDialog();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showTipsDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Password Tips'),
          content: SingleChildScrollView(
            child: ListBody(
              children: const [
                Text(
                  '• Use at least 12 characters.\n'
                      '• Include both uppercase and lowercase letters.\n'
                      '• Add numbers and symbols.\n'
                      '• Avoid using real words or easily guessable information.\n'
                      '• Consider using a password manager for stronger security.\n',
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showAboutUsDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('About Us'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '\nWEBSITE :- ',
                style: TextStyle(color: Colors.black),
              ),
              GestureDetector(
                onTap: () {
                  launchUrl(
                      Uri.parse('https://raja-debnath.github.io/Pass_deploy/'));
                },
                child: const Text(
                  'https://raja-debnath.github.io/Pass_deploy/\n',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'CONTACT MAIL :- ',
                style: TextStyle(color: Colors.black),
              ),
              GestureDetector(
                onTap: () {
                  launchUrl(Uri.parse('mailto:mrayushh.at@gmail.com'));
                },
                child: const Text(
                  'mrayushh.at@gmail.com\n',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'GITHUB :- ',
                style: TextStyle(color: Colors.black),
              ),
              GestureDetector(
                onTap: () {
                  launchUrl(Uri.parse('https://github.com/Mr-Ayushh'));
                },
                child: const Text(
                  'https://github.com/Mr-Ayushh\n',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Password Generator'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: showHistoryDialog,
          ),
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _showInfoDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Center(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  color: _includeAlphabets
                                      ? Colors.purple
                                      : Colors.grey[300],
                                  border: Border.all(
                                    color: Colors.purple,
                                    width: 2,
                                  ),
                                ),
                                child: Checkbox(
                                  value: _includeAlphabets,
                                  onChanged: (bool? value) {
                                    setState(() {
                                      _includeAlphabets = value ?? false;
                                    });
                                  },
                                  activeColor: Colors.transparent,
                                  checkColor: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Text('Alphabets',
                                  style: TextStyle(color: Colors.black)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  color: _includeNumbers
                                      ? Colors.purple
                                      : Colors.grey[300],
                                  border: Border.all(
                                    color: Colors.purple,
                                    width: 2,
                                  ),
                                ),
                                child: Checkbox(
                                  value: _includeNumbers,
                                  onChanged: (bool? value) {
                                    setState(() {
                                      _includeNumbers = value ?? false;
                                    });
                                  },
                                  activeColor: Colors.transparent,
                                  checkColor: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Text('Numbers',
                                  style: TextStyle(color: Colors.black)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(5),
                                  color: _includeSymbols
                                      ? Colors.purple
                                      : Colors.grey[300],
                                  border: Border.all(
                                    color: Colors.purple,
                                    width: 2,
                                  ),
                                ),
                                child: Checkbox(
                                  value: _includeSymbols,
                                  onChanged: (bool? value) {
                                    setState(() {
                                      _includeSymbols = value ?? false;
                                    });
                                  },
                                  activeColor: Colors.transparent,
                                  checkColor: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Text('Symbols',
                                  style: TextStyle(color: Colors.black)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      child: TextField(
                        controller: _lengthController,
                        decoration: InputDecoration(
                          labelText: 'Password Length',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[200],
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: <TextInputFormatter>[
                          FilteringTextInputFormatter.digitsOnly
                        ],
                        onChanged: (value) {
                          setState(() {
                            _passwordLength = int.tryParse(value) ?? 12;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('Combine Hints (Optional)'),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      child: TextField(
                        controller: _hintsController,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          filled: true,
                          fillColor: Colors.grey[200],
                        ),
                        onChanged: (value) {
                          setState(() {
                            _hints = value;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final password = generatePasswordWithHints();
                  setState(() {
                    _generatedPassword = password;
                    updatePasswordStrength(password);
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  padding:
                  const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                child: const Text(
                  'GENERATE',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.grey[300]!,
                    width: 1,
                  ),
                ),
                child: Column(
                  children: [
                    SelectableText(
                      _generatedPassword.isEmpty
                          ? 'Password will appear here.'
                          : _generatedPassword,
                      style: const TextStyle(
                        fontSize: 18,
                        fontFamily: 'Courier',
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _passwordStrength,
                      style: TextStyle(
                        fontSize: 16,
                        color: _passwordStrength.contains('Strong')
                            ? Colors.green
                            : _passwordStrength.contains('Medium')
                            ? Colors.orange
                            : Colors.red,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'The more bits of entropy, the more secure your password. Aim for higher entropy for better protection.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _generatedPassword.isEmpty
                    ? null
                    : () {
                  Clipboard.setData(
                    ClipboardData(text: _generatedPassword),
                  );
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Password is copied to clipboard!'),
                    ),
                  );
                  addToHistory(_generatedPassword);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding:
                  const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
                child: const Text(
                  'COPY',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  double log2(double x) => log(x) / ln2;
}