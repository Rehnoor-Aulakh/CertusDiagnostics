import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import java.lang.reflect.Method;
public class PrintOptions2 {
    public static void main(String[] args) {
        for (Method m : GoogleGenAiTextEmbeddingOptions.builder().getClass().getMethods()) {
            System.out.println(m.getName());
        }
    }
}
