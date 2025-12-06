import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function DocsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background p-6">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Integration guide for onboarding in your application
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <Badge className="w-fit mb-2">1</Badge>
                  <CardTitle className="text-lg">Create a Project</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Create a new project and get a unique API key for integration.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <Badge className="w-fit mb-2">2</Badge>
                  <CardTitle className="text-lg">Configure Screens</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Use the visual editor to create onboarding screens with widgets.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <Badge className="w-fit mb-2">3</Badge>
                  <CardTitle className="text-lg">Integrate</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Connect the API to your application and display the onboarding.
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">API Reference</h2>
            
            <Tabs defaultValue="get-config" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="get-config">Get Config</TabsTrigger>
                <TabsTrigger value="send-event">Send Events</TabsTrigger>
              </TabsList>

              <TabsContent value="get-config">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm">/api/public/onboarding</code>
                    </div>
                    <CardDescription>
                      Get the published onboarding configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Query Parameters</h4>
                      <div className="bg-muted rounded-lg p-3">
                        <code className="text-sm">api_key</code>
                        <span className="text-muted-foreground text-sm ml-2">- your public API key</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Request Example</h4>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
{`GET /api/public/onboarding?api_key=YOUR_API_KEY

// Dart/Flutter example
final response = await http.get(
  Uri.parse('\${baseUrl}/api/public/onboarding?api_key=\$apiKey'),
);
final config = jsonDecode(response.body);`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Response Example</h4>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "version": 3,
  "screens": [
    {
      "type": "default",
      "title": "Welcome",
      "description": "Screen description",
      "image_url": "https://...",
      "widgets": [
        {
          "id": "widget-1",
          "type": "text",
          "order": 0,
          "content": "Heading",
          "fontSize": 24,
          "fontWeight": "bold",
          "textAlign": "center"
        },
        {
          "id": "widget-2", 
          "type": "image",
          "order": 1,
          "url": "https://...",
          "width": "100%",
          "height": "200px",
          "objectFit": "contain"
        },
        {
          "id": "widget-3",
          "type": "button",
          "order": 2,
          "label": "Next",
          "action": "next",
          "variant": "primary",
          "fullWidth": true
        }
      ],
      "layout": {
        "background_color": "#ffffff",
        "padding": 16,
        "vertical_alignment": "center"
      }
    }
  ]
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="send-event">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge>
                      <code className="text-sm">/api/public/event</code>
                    </div>
                    <CardDescription>
                      Send an analytics event (screen view)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Request Body</h4>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "api_key": "YOUR_API_KEY",
  "onboarding_version": 3,
  "screen_index": 0,
  "timestamp": 1234567890  // optional
}`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Example (Dart/Flutter)</h4>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
{`await http.post(
  Uri.parse('\${baseUrl}/api/public/event'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'api_key': apiKey,
    'onboarding_version': config['version'],
    'screen_index': currentScreenIndex,
  }),
);`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">Widget Types</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">text</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Text widget with font customization</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "text",
  "content": "Text",
  "fontSize": 16,
  "fontWeight": "bold",
  "color": "#000000",
  "textAlign": "center"
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">image</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Image with size customization</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "image",
  "url": "https://...",
  "width": "100%",
  "height": "200px",
  "objectFit": "contain",
  "borderRadius": 8
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">button</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Button with action</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "button",
  "label": "Next",
  "action": "next", // next, skip, url, custom
  "actionValue": "https://...",
  "variant": "primary",
  "fullWidth": true
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">spacer</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Vertical spacing</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "spacer",
  "height": 24
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">icon</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Icon from the library</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "icon",
  "name": "Star",
  "size": 48,
  "color": "#6366f1"
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">lottie</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground mb-2">Lottie animation</p>
                  <pre className="bg-muted rounded p-2 text-xs">
{`{
  "type": "lottie",
  "url": "https://assets.lottie...",
  "width": "200px",
  "height": "200px",
  "loop": true,
  "autoplay": true
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">Flutter Integration Example</h2>
            
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
{`import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

class OnboardingService {
  final String baseUrl;
  final String apiKey;
  
  OnboardingService({required this.baseUrl, required this.apiKey});
  
  Future<Map<String, dynamic>> fetchConfig() async {
    final response = await http.get(
      Uri.parse('\$baseUrl/api/public/onboarding?api_key=\$apiKey'),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load onboarding config');
  }
  
  Future<void> trackScreenView(int version, int screenIndex) async {
    await http.post(
      Uri.parse('\$baseUrl/api/public/event'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'api_key': apiKey,
        'onboarding_version': version,
        'screen_index': screenIndex,
      }),
    );
  }
}

// Usage:
class OnboardingScreen extends StatefulWidget {
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final service = OnboardingService(
    baseUrl: 'https://your-app.replit.app',
    apiKey: 'YOUR_API_KEY',
  );
  
  Map<String, dynamic>? config;
  int currentScreen = 0;
  
  @override
  void initState() {
    super.initState();
    loadConfig();
  }
  
  Future<void> loadConfig() async {
    final data = await service.fetchConfig();
    setState(() => config = data);
    trackView(0);
  }
  
  void trackView(int index) {
    if (config != null) {
      service.trackScreenView(config!['version'], index);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (config == null) {
      return Center(child: CircularProgressIndicator());
    }
    
    final screens = config!['screens'] as List;
    final screen = screens[currentScreen];
    final widgets = screen['widgets'] as List? ?? [];
    
    return Scaffold(
      body: Container(
        color: Color(int.parse(
          (screen['layout']['background_color'] ?? '#ffffff')
            .replaceFirst('#', 'ff'),
          radix: 16,
        )),
        padding: EdgeInsets.all(
          (screen['layout']['padding'] ?? 16).toDouble(),
        ),
        child: Column(
          children: widgets.isEmpty
            ? _buildLegacyScreen(screen)
            : widgets.map((w) => _buildWidget(w)).toList(),
        ),
      ),
    );
  }
  
  List<Widget> _buildLegacyScreen(Map screen) {
    return [
      if (screen['image_url'] != null)
        Expanded(child: Image.network(screen['image_url'])),
      Text(screen['title'] ?? '', style: TextStyle(fontSize: 24)),
      Text(screen['description'] ?? ''),
    ];
  }
  
  Widget _buildWidget(Map w) {
    switch (w['type']) {
      case 'text':
        return Text(
          w['content'] ?? '',
          style: TextStyle(
            fontSize: (w['fontSize'] ?? 16).toDouble(),
            fontWeight: _getFontWeight(w['fontWeight']),
            color: _parseColor(w['color']),
          ),
          textAlign: _getTextAlign(w['textAlign']),
        );
      case 'image':
        return Container(
          width: _parseSize(w['width']),
          height: _parseSize(w['height']),
          child: w['url'] != null 
            ? Image.network(w['url'], fit: _getBoxFit(w['objectFit']))
            : Container(color: Colors.grey[200]),
        );
      case 'button':
        return SizedBox(
          width: w['fullWidth'] == true ? double.infinity : null,
          child: ElevatedButton(
            onPressed: () => _handleAction(w['action'], w['actionValue']),
            child: Text(w['label'] ?? 'Button'),
          ),
        );
      case 'spacer':
        return SizedBox(height: (w['height'] ?? 16).toDouble());
      default:
        return SizedBox();
    }
  }
  
  void _handleAction(String? action, String? value) {
    switch (action) {
      case 'next':
        if (currentScreen < (config!['screens'] as List).length - 1) {
          setState(() => currentScreen++);
          trackView(currentScreen);
        }
        break;
      case 'skip':
        Navigator.of(context).pop();
        break;
      case 'url':
        // Open URL
        break;
    }
  }
  
  // Helper methods...
}`}
                </pre>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section className="pb-8">
            <h2 className="text-xl font-semibold mb-4">Available Icons</h2>
            <p className="text-muted-foreground mb-4">
              When using the icon widget, the following icons are available:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Star", "Heart", "Check", "X", "ArrowRight", "ChevronRight",
                "Sparkles", "Zap", "Bell", "Settings", "User", "Home",
                "Mail", "Phone", "Camera", "MapPin", "Calendar", "Clock", "Search"
              ].map((icon) => (
                <Badge key={icon} variant="outline">{icon}</Badge>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
