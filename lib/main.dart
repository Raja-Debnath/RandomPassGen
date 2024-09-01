import 'package:flutter/material.dart';
import 'dart:math';
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

class _PasswordGeneratorScreenState extends State<PasswordGeneratorScreen>
    with SingleTickerProviderStateMixin {
  bool _includeAlphabets = true;
  bool _includeNumbers = true;
  bool _includeSymbols = true;
  int _passwordLength = 12;
  String _generatedPassword = '';
  String _passwordStrength = 'Weak';
  List<String> _passwordHistory = [];
  late AnimationController _animationController;
  late Animation<double> _animation;

  final String numbers = '0123456789';
  final String alphabets =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  final String symbols = '!@#\$%^&*()_+-=[]{}|;:,.<>?/';

  @override
  void initState() {
    super.initState();
    _loadPasswordHistory();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _animation =
        CurvedAnimation(parent: _animationController, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  String generatePassword() {
    final pools = <String>[];
    if (_includeAlphabets) pools.add(alphabets);
    if (_includeNumbers) pools.add(numbers);
    if (_includeSymbols) pools.add(symbols);

    if (pools.isEmpty) {
      throw Exception('At least one character type must be enabled');
    }

    final password = <String>[];
    final random = Random();
    for (int i = 0; i < _passwordLength; i++) {
      String pool = pools[random.nextInt(pools.length)];
      String character = pool[random.nextInt(pool.length)];
      password.add(character);
    }

    return password.join('');
  }

  void updatePasswordStrength(String password) {
    int score = 0;
    if (password.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(password)) score++;
    if (RegExp(r'[a-z]').hasMatch(password)) score++;
    if (RegExp(r'[0-9]').hasMatch(password)) score++;
    if (RegExp(r'[!@#\$%^&*()_+\-=\[\]{}|;:,.<>?/]').hasMatch(password))
      score++;

    setState(() {
      if (score <= 2) {
        _passwordStrength = 'Weak';
      } else if (score == 3) {
        _passwordStrength = 'Medium';
      } else {
        _passwordStrength = 'Strong';
      }
    });
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
          title: const Text('Password History'),
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
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Close'),
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
          title: const Text('Info'),
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
                  title: const Text('Tips for Passwords'),
                  onTap: () {
                    Navigator.of(context).pop();
                    _showTipsDialog();
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  void _showTipsDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Tips for Passwords'),
          content: SingleChildScrollView(
            child: ListBody(
              children: const [
                Text(
                  '• Use at least 12 characters.\n'
                  '• Include both uppercase and lowercase letters.\n'
                  '• Add numbers and symbols.\n'
                  '• Avoid using real words or easily guessable information.\n'
                  '• Consider using a password manager for stronger security.',
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
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
              GestureDetector(
                onTap: () {
                  launchUrl(
                      Uri.parse('https://raja-debnath.github.io/Pass_deploy/'));
                },
                child: const Text(
                  'WEBSITE: https://raja-debnath.github.io/Pass_deploy/',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () {
                  launchUrl(Uri.parse('mailto:mrayushh.at@gmail.com'));
                },
                child: const Text(
                  'CONTACT E-MAIL: mrayushh.at@gmail.com',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () {
                  launchUrl(Uri.parse('https://github.com/Mr-Ayushh'));
                },
                child: const Text(
                  'GITHUB: https://github.com/Mr-Ayushh',
                  style: TextStyle(
                      color: Colors.blue, decoration: TextDecoration.underline),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
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
            mainAxisSize: MainAxisSize.min,
            children: [
              FittedBox(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Checkbox(
                            value: _includeAlphabets,
                            onChanged: (bool? value) {
                              setState(() {
                                _includeAlphabets = value ?? false;
                              });
                            },
                            activeColor: Colors.purple,
                          ),
                          const Text('Alphabets',
                              style: TextStyle(color: Colors.black)),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        children: [
                          Checkbox(
                            value: _includeNumbers,
                            onChanged: (bool? value) {
                              setState(() {
                                _includeNumbers = value ?? false;
                              });
                            },
                            activeColor: Colors.purple,
                          ),
                          const Text('Numbers',
                              style: TextStyle(color: Colors.black)),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        children: [
                          Checkbox(
                            value: _includeSymbols,
                            onChanged: (bool? value) {
                              setState(() {
                                _includeSymbols = value ?? false;
                              });
                            },
                            activeColor: Colors.purple,
                          ),
                          const Text('Symbols',
                              style: TextStyle(color: Colors.black)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Password Length:',
                  border: OutlineInputBorder(),
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
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final password = generatePassword();
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
                child: Text(
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
                child: AnimatedBuilder(
                  animation: _animation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1 + _animation.value * 0.05,
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            SelectableText(
                              _generatedPassword.isEmpty
                                  ? 'Your password will appear here.'
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
                              'Strength: $_passwordStrength',
                              style: TextStyle(
                                fontSize: 16,
                                color: _passwordStrength == 'Strong'
                                    ? Colors.green
                                    : _passwordStrength == 'Medium'
                                        ? Colors.orange
                                        : Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
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
}
