import org.springframework.ai.google.genai.GoogleGenAiEmbeddingOptions;
import java.lang.reflect.Method;
public class PrintOptions {
    public static void main(String[] args) {
        for (Method m : GoogleGenAiEmbeddingOptions.class.getMethods()) {
            if (m.getName().toLowerCase().contains("dimension")) {
                System.out.println(m.getName());
            }
        }
    }
}
