const task =
    document.getElementById("task");

const inputText =
    document.getElementById("inputText");

const quizCountWrap =
    document.getElementById("quizCountWrap");

const quizCount =
    document.getElementById("quizCount");

const submitBtn =
    document.getElementById("submitBtn");

const clearBtn =
    document.getElementById("clearBtn");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const resultCard =
    document.getElementById("resultCard");

const result =
    document.getElementById("result");

const quizCard =
    document.getElementById("quizCard");

const quiz =
    document.getElementById("quiz");

const checkQuizBtn =
    document.getElementById("checkQuizBtn");

const score =
    document.getElementById("score");

const copyBtn =
    document.getElementById("copyBtn");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");


let currentQuiz = null;



const endpoints = {

    qa: {
        endpoint: "/qa",

        body: value => ({
            question: value
        })
    },

    explain: {
        endpoint: "/explain",

        body: value => ({
            text: value
        })
    },

    summarize: {
        endpoint: "/summarize",

        body: value => ({
            text: value
        })
    },

    learn: {
        endpoint:
            "/learn/recommendations",

        body: value => ({
            text: value
        })
    }

};



task.addEventListener(
    "change",
    function () {

        const quizSelected =
            task.value === "quiz";

        quizCountWrap.classList.toggle(
            "hidden",
            !quizSelected
        );


        if (quizSelected) {

            submitBtn.textContent =
                "Generate Quiz";

        } else {

            submitBtn.textContent =
                "Generate Answer";

        }


        if (task.value === "summarize") {

            inputText.placeholder =
                "Paste your study material here...";

        } else if (task.value === "quiz") {

            inputText.placeholder =
                "Example: Python Programming";

        } else if (task.value === "learn") {

            inputText.placeholder =
                "Example: Data Structures";

        } else {

            inputText.placeholder =
                "Example: Explain Python variables";

        }

    }
);



submitBtn.addEventListener(
    "click",
    async function () {

        const value =
            inputText.value.trim();


        if (!value) {

            showError(
                "Please enter something first."
            );

            return;

        }


        hideError();

        resultCard.classList.add(
            "hidden"
        );

        hideQuiz();

        setLoading(true);


        try {

            if (task.value === "quiz") {

                await generateQuiz(
                    value
                );

            } else {

                const config =
                    endpoints[task.value];


                const data =
                    await postJSON(

                        config.endpoint,

                        config.body(value)

                    );


                result.textContent =
                    data.result;


                resultCard.classList.remove(
                    "hidden"
                );

            }

        } catch (error) {

            showError(
                error.message
            );

        } finally {

            setLoading(false);

        }

    }
);



async function generateQuiz(topic) {

    const data =
        await postJSON(

            "/quiz",

            {
                topic: topic,

                num_questions:
                    Number(
                        quizCount.value
                    )
            }

        );


    currentQuiz = data;


    renderQuiz(
        data.questions
    );


    quizCard.classList.remove(
        "hidden"
    );

}



function renderQuiz(questions) {

    quiz.innerHTML =
        questions.map(

            (question, index) => `

                <div
                    class="quiz-question"
                    data-index="${index}"
                >

                    <h3>
                        ${index + 1}.
                        ${escapeHTML(
                            question.question
                        )}
                    </h3>


                    ${question.options
                        .map(
                            (option, optionIndex) => `

                            <label class="option">

                                <input
                                    type="radio"
                                    name="question-${index}"
                                    value="${optionIndex}"
                                >

                                ${escapeHTML(option)}

                            </label>

                        `
                        )
                        .join("")}


                    <div
                        class="quiz-feedback"
                    ></div>

                </div>

            `

        ).join("");


    checkQuizBtn.classList.remove(
        "hidden"
    );

}



checkQuizBtn.addEventListener(
    "click",
    function () {

        if (!currentQuiz) {
            return;
        }


        let correct = 0;


        currentQuiz.questions
            .forEach(

                (question, index) => {

                    const box =
                        document.querySelector(
                            `.quiz-question[data-index="${index}"]`
                        );


                    const selected =
                        box.querySelector(
                            `input[name="question-${index}"]:checked`
                        );


                    const labels =
                        box.querySelectorAll(
                            ".option"
                        );


                    const feedback =
                        box.querySelector(
                            ".quiz-feedback"
                        );


                    labels.forEach(
                        label => {

                            label.classList.remove(
                                "correct",
                                "wrong"
                            );

                        }
                    );


                    if (!selected) {

                        feedback.textContent =
                            `Correct answer: ${question.answer}`;

                        return;

                    }


                    const selectedIndex =
                        Number(
                            selected.value
                        );


                    const selectedAnswer =
                        question.options[
                            selectedIndex
                        ];


                    if (
                        selectedAnswer ===
                        question.answer
                    ) {

                        correct++;


                        labels[
                            selectedIndex
                        ].classList.add(
                            "correct"
                        );


                        feedback.textContent =
                            "Correct! " +
                            question.explanation;

                    } else {

                        labels[
                            selectedIndex
                        ].classList.add(
                            "wrong"
                        );


                        const correctIndex =
                            question.options.indexOf(
                                question.answer
                            );


                        if (correctIndex >= 0) {

                            labels[
                                correctIndex
                            ].classList.add(
                                "correct"
                            );

                        }


                        feedback.textContent =
                            `Correct answer: ${question.answer}. ` +
                            question.explanation;

                    }

                }

            );


        score.textContent =
            `Score: ${correct}/${currentQuiz.questions.length}`;

    }
);



clearBtn.addEventListener(
    "click",
    function () {

        inputText.value = "";

        result.textContent = "";

        resultCard.classList.add(
            "hidden"
        );

        hideQuiz();

        hideError();

    }
);



copyBtn.addEventListener(
    "click",
    async function () {

        try {

            await navigator.clipboard.writeText(
                result.textContent
            );


            copyBtn.textContent =
                "Copied!";


            setTimeout(
                () => {

                    copyBtn.textContent =
                        "Copy";

                },
                1200
            );

        } catch {

            showError(
                "Unable to copy."
            );

        }

    }
);



async function postJSON(
    url,
    body
) {

    const response =
        await fetch(

            url,

            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(body)
            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Server error."
        );

    }


    return data;

}



function setLoading(
    loadingState
) {

    loading.classList.toggle(
        "hidden",
        !loadingState
    );


    submitBtn.disabled =
        loadingState;

}



function showError(
    message
) {

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );

}



function hideError() {

    errorBox.classList.add(
        "hidden"
    );

    errorBox.textContent = "";

}



function hideQuiz() {

    quizCard.classList.add(
        "hidden"
    );

    quiz.innerHTML = "";

    checkQuizBtn.classList.add(
        "hidden"
    );

    currentQuiz = null;

    score.textContent = "";

}



function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



async function checkServer() {

    try {

        const response =
            await fetch(
                "/health"
            );


        const data =
            await response.json();


        if (data.demo_mode) {

            statusText.textContent =
                "Server Online • Demo Mode";

        } else {

            statusText.textContent =
                "Server Online • Gemini AI";

        }


        statusDot.style.background =
            "#2ecc71";

    } catch {

        statusText.textContent =
            "Server Offline";

        statusDot.style.background =
            "#e74c3c";

    }

}


checkServer();