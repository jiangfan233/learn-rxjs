跟着《深入浅出Rxjs》学rxjs，看完一本再说。

rxjs既实现了观察者模式又实现了迭代器模式；

观察者模式：
<ul>
<li>
作为一个controller把数据源（用户行为）和处理器（handler）通过source$.subscribe(observer)结合在一起；
</li>
<li>通过运算符组建数据流通管道处理数据；</li>
</ul>
迭代器模式：
<ul>
<li>数据源要求观察者（subscriber）必须实现next、complete、error中至少一个方法，从而保证数据流通；</li>
<li>source$.subscribe(observer)观察者作为参数交给数据源，保证观察者“随时可用”</li>
</ul>


高阶函数可用来保存执行上下文context,从而摆脱this困扰,但也因此不能直接使用链式调用；

关于 fakeRepeatWhen(repeatWhen) 的问题：
<ul>
    <li>
        期望：</br>
        1、controller$数据流complete的时候能够下游也能正常结束，<br/>
        2、controller$数据流complete的时候能够在重新订阅自身
    </li>
    <li>
        实际：<br/>
        1、controller$数据流只是不再产生数据，不再调用nextFunc了<br/>
        2、实际上当controller$数据流complete的时候，并没有调用observer.complete,即下游并没有被通知到。</br>
        3、而且因为递归中缺少判断条件，会导致无限循环
    </li>
    <li>
        解决方法：<br/>
        当一个Observable 还有数据产生时，会先调用observer.next，
        然后在某一个时刻调用 observer.complete<br/>
        如果该Observable 已经没有数据，会直接调用 observer.complete<br/>
        所以只需要维护一个根据 observer.next 是否调用的来改变状态的状态变量即可<br/>
        该变量同时也表示Observable是否已经complete
    </li>
    <li>
        上述方法缺陷：<br/>
        如果fakeRepeatWhen(notifier)中notifier返回一个cold Observable，
        该Observable在每次调用完observer.next 之后调用 observer.complete，
        又会导致 controller$ 重新订阅 => 无限循环;<br/>
        关键在于如何知道controller$ 什么时候应该重新订阅，什么时候应该调用observer.complete
    </li>
</ul>

**合并运算符**
<ul>
    <li>merge用于合并多个数据源，常用于异步处理多个数据源，先到先得；可指定一个concurrent用与控制数据源并行数量。</li>
    <li>
        zip和combineLatest的区别在于<br/>
zip每吐出一个数据集合都需要等待所有数据源吐出数据（数据源的数据是 and 的关系）;<br/>
combineLatest 仅仅在第一次吐出数据集合的时候等待所有数据源，后面要任意数据源产生数据都会吐出数据集合（数据源的数据从 and 变为 or）<br/>
    combineLatest 小缺陷：<br/>
    对于同时到来的两个或多个数据，本应该产生一个输出，实际结果却产生了两个或多个，<br/>
    因为多个数据源同时产生数据，同时产生多个宏任务，因此也就无法使用微任务解决这个缺陷（个人猜测）<br/>
    </li>
    <li>
        withLatestFrom 解决了zip、combineLatest中的多重继承问题（glitch）<br/>
        glitch 问题的根源在于多个Observable同时有数据到来时都会向下游吐出数据，因此会出现同一个时刻吐出多个数据的情况<br/>
        withLatestFrom解决方式：<br/>
        1、提供一个控制者Observble作为Controller，其他Observable作为从属仅提供数据（不向下游提供数据）<br/>
        2、controller向下游吐出数据（因此也把Subscription提供给下游）<br/>
        3、controller自身有数据时会检查 从属者是否已经提供数据（而不管数据何时提供的）<br/>
        上面三点决定了在订阅controller之前势必要先订阅从属者最后订阅controller，也就给了当同时多个Observable吐出数据时从属者更新数据的机会
    </li>
    <li>
        race 第一个吐出数据Observable对象保留订阅状态，其他observable直接取消订阅；”赢者通吃“
    </li>
    <li>
        startWith 直接在订阅后吐出参数，而不管observable内部shadule
    </li>
    <li>
        forkjoin 等待所有bservable对象都完结（completed）时候把所有observable对象的最后一个数据组合后吐出
    </li>
</ul>